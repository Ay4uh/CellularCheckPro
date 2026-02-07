package com.cellularcheckpro

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import com.facebook.react.bridge.*
import java.util.*

class SecurityModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SecurityModule"
    }

    @ReactMethod
    fun checkConnectivity(promise: Promise) {
        promise.resolve("CONNECTED_V3")
    }

    @ReactMethod
    fun getAppInventory(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            
            // Use getInstalledApplications instead of getInstalledPackages for faster/broader access
            val apps = pm.getInstalledApplications(0)
            
            val result = Arguments.createMap()
            val systemAppList = Arguments.createArray()
            val userAppList = Arguments.createArray()
            val hiddenAppList = Arguments.createArray()
            val suspiciousPackages = Arguments.createArray()

            for (app in apps) {
                try {
                    val appMap = Arguments.createMap()
                    val label = pm.getApplicationLabel(app).toString()
                    val pInfo = pm.getPackageInfo(app.packageName, 0)
                    
                    appMap.putString("name", label)
                    appMap.putString("packageName", app.packageName)
                    appMap.putDouble("installTime", pInfo.firstInstallTime.toDouble())
                    
                    // Simple size estimation without heavy File operations for now
                    appMap.putDouble("size", 0.0)

                    val isSystem = (app.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                    if (isSystem) {
                        systemAppList.pushMap(appMap)
                    } else {
                        userAppList.pushMap(appMap)
                    }

                    // Check for hidden apps (no launcher intent)
                    val intent = pm.getLaunchIntentForPackage(app.packageName)
                    if (intent == null && !isSystem) {
                        hiddenAppList.pushMap(appMap)
                    }

                    // Heuristic Malware Check
                    val pkgName = app.packageName.lowercase(Locale.ROOT)
                    if (pkgName.contains("spyware") || 
                        pkgName.contains("trojan") || 
                        pkgName.contains("malware")) {
                        suspiciousPackages.pushString(app.packageName)
                    }
                } catch (e: Exception) {
                    continue
                }
            }

            result.putArray("systemApps", systemAppList)
            result.putArray("userApps", userAppList)
            result.putArray("hiddenApps", hiddenAppList)
            result.putArray("suspiciousPackages", suspiciousPackages)

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getBrowserSettingsInfo(promise: Promise) {
        val pm = reactApplicationContext.packageManager
        val browsers = mutableListOf<String>()
        val browserPackages = arrayOf("com.android.chrome", "org.mozilla.firefox", "com.opera.browser", "com.microsoft.emmx")
        
        val result = Arguments.createMap()
        for (pkg in browserPackages) {
            try {
                pm.getPackageInfo(pkg, 0)
                browsers.add(pkg)
            } catch (e: PackageManager.NameNotFoundException) { }
        }
        
        val browserArray = Arguments.createArray()
        for (b in browsers) browserArray.pushString(b)
        result.putArray("installedBrowsers", browserArray)
        promise.resolve(result)
    }
}
