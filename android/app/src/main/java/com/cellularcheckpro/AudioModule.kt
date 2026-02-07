package com.cellularcheckpro

import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AudioModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val audioManager: AudioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val TAG = "AudioModule"

    override fun getName(): String {
        return "AudioModule"
    }

    @ReactMethod
    fun setSpeakerphoneOn(on: Boolean) {
        Log.d(TAG, "setSpeakerphoneOn: $on, SDK: ${Build.VERSION.SDK_INT}")
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (on) {
                Log.d(TAG, "Clearing communication device")
                audioManager.clearCommunicationDevice()
            } else {
                val devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
                var earpieceFound = false
                for (device in devices) {
                    if (device.type == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE) {
                        Log.d(TAG, "Found earpiece, setting as communication device")
                        audioManager.setCommunicationDevice(device)
                        earpieceFound = true
                        break
                    }
                }
                if (!earpieceFound) {
                    Log.w(TAG, "Earpiece NOT found in output devices!")
                }
            }
        }
        
        Log.d(TAG, "Setting isSpeakerphoneOn to $on")
        audioManager.isSpeakerphoneOn = on
    }

    @ReactMethod
    fun setMode(mode: Int) {
        Log.d(TAG, "setMode: $mode")
        audioManager.mode = mode
    }
}
