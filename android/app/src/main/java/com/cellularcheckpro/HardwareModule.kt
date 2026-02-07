package com.cellularcheckpro

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.hardware.camera2.CameraManager
import android.telephony.TelephonyManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.view.KeyEvent
import android.content.Intent
import android.content.IntentFilter
import android.content.BroadcastReceiver
import android.view.WindowManager
import android.util.DisplayMetrics
import android.util.Log
import android.os.Build

class HardwareModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), SensorEventListener {

    private val sensorManager: SensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val proximitySensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY)
    private val cameraManager: CameraManager = reactContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private val telephonyManager: TelephonyManager = reactContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    private var cameraId: String? = null

    companion object {
        var instance: HardwareModule? = null
        
        fun handleKeyEvent(keyCode: Int, isDown: Boolean) {
            instance?.sendKeyEvent(keyCode, isDown)
        }
    }

    init {
        instance = this
        try {
            cameraId = cameraManager.cameraIdList[0]
        } catch (e: Exception) {
            e.printStackTrace()
        }
        setupHeadsetReceiver()
    }

    private fun setupHeadsetReceiver() {
        val filter = IntentFilter(Intent.ACTION_HEADSET_PLUG)
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                if (intent?.action == Intent.ACTION_HEADSET_PLUG) {
                    val state = intent.getIntExtra("state", -1)
                    val params = Arguments.createMap()
                    params.putBoolean("plugged", state == 1)
                    sendEvent("onHeadsetPlugChange", params)
                }
            }
        }
        reactApplicationContext.registerReceiver(receiver, filter)
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    fun sendKeyEvent(keyCode: Int, isDown: Boolean) {
        val params = Arguments.createMap()
        params.putInt("keyCode", keyCode)
        params.putBoolean("isDown", isDown)
        
        val eventName = when (keyCode) {
            KeyEvent.KEYCODE_VOLUME_UP -> "onVolumeUpPress"
            KeyEvent.KEYCODE_VOLUME_DOWN -> "onVolumeDownPress"
            KeyEvent.KEYCODE_POWER -> "onPowerButtonPress"
            else -> "onKeyPress"
        }
        sendEvent(eventName, params)
    }

    override fun getName(): String {
        return "HardwareModule"
    }

    // --- Flash ---
    @ReactMethod
    fun setFlashlight(enabled: Boolean) {
        try {
            cameraId?.let {
                cameraManager.setTorchMode(it, enabled)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // --- Proximity ---
    @ReactMethod
    fun startProximityTracking() {
        proximitySensor?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    @ReactMethod
    fun stopProximityTracking() {
        sensorManager.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_PROXIMITY) {
            val distance = event.values[0]
            val isNear = distance < (proximitySensor?.maximumRange ?: 5f)
            
            val params = Arguments.createMap()
            params.putBoolean("isNear", isNear)
            params.putDouble("distance", distance.toDouble())
            
            sendEvent("onProximityChange", params)
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built-in Event Emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built-in Event Emitter
    }

    // --- SIM / Signal ---
    @ReactMethod
    fun getSimStatus(promise: Promise) {
        val map = Arguments.createMap()
        map.putInt("simState", telephonyManager.simState)
        map.putString("carrierName", telephonyManager.networkOperatorName)
        map.putBoolean("isNetworkRoaming", telephonyManager.isNetworkRoaming)
        promise.resolve(map)
    }

    @ReactMethod
    fun getBiometricFeatures(promise: Promise) {
        val pm = reactApplicationContext.packageManager
        val map = Arguments.createMap()
        map.putBoolean("hasFace", pm.hasSystemFeature("android.hardware.biometrics.face"))
        map.putBoolean("hasFingerprint", pm.hasSystemFeature("android.hardware.fingerprint") || pm.hasSystemFeature("android.hardware.biometrics.fingerprint"))
        map.putBoolean("hasIris", pm.hasSystemFeature("android.hardware.biometrics.iris"))
        promise.resolve(map)
    }

    @ReactMethod
    fun getExtraHardwareDetails(promise: Promise) {
        Log.d("HardwareModule", "getExtraHardwareDetails called")
        val map = Arguments.createMap()
        try {
            val metrics = reactApplicationContext.resources.displayMetrics
            map.putDouble("xdpi", metrics.xdpi.toDouble())
            map.putDouble("ydpi", metrics.ydpi.toDouble())
            map.putInt("densityDpi", metrics.densityDpi)
            
            try {
                val windowManager = reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as android.view.WindowManager
                val display = windowManager.defaultDisplay
                map.putDouble("refreshRate", display?.refreshRate?.toDouble() ?: 60.0)
            } catch (e: Exception) {
                map.putDouble("refreshRate", 0.0)
            }
            
            map.putString("hardware", android.os.Build.HARDWARE ?: "N/A")
            map.putString("board", android.os.Build.BOARD ?: "N/A")
            map.putString("soc", if (android.os.Build.VERSION.SDK_INT >= 31) (android.os.Build.SOC_MODEL ?: "N/A") else "N/A")
            map.putString("supportedAbis", android.os.Build.SUPPORTED_ABIS?.joinToString(", ") ?: "N/A")
            
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERR_HD_DETAIL", e.message)
        }
    }

    @ReactMethod
    fun getImeis(promise: Promise) {
        Log.d("HardwareModule", "getImeis called")
        val map = Arguments.createMap()
        try {
            if (android.os.Build.VERSION.SDK_INT < 29) {
                val id = try { telephonyManager.deviceId } catch (e: Exception) { null }
                map.putString("imei1", id ?: "Unknown")
            } else {
                map.putString("imei1", "Restricted")
            }
        } catch (e: SecurityException) {
            map.putString("imei1", "PermissionDeny")
        } catch (e: Exception) {
            map.putString("imei1", "N/A")
        }
        promise.resolve(map)
    }

    @ReactMethod
    fun getCpuFrequencies(promise: Promise) {
        try {
            val cpuFreqs = Arguments.createArray()
            val numCores = Runtime.getRuntime().availableProcessors()

            for (i in 0 until numCores) {
                try {
                    val reader = java.io.BufferedReader(java.io.FileReader("/sys/devices/system/cpu/cpu$i/cpufreq/scaling_cur_freq"))
                    val freq = reader.readLine().toLong() / 1000 // Convert kHz to MHz
                    reader.close()
                    cpuFreqs.pushInt(freq.toInt())
                } catch (e: Exception) {
                    // If we can't read a core (e.g. offline), push 0 or valid fallback
                    cpuFreqs.pushInt(0)
                }
            }
            promise.resolve(cpuFreqs)
        } catch (e: Exception) {
            promise.reject("CPU_FREQ_ERR", e.message)
        }
    }
}
