//
//  HardwareModule.swift
//  CellularCheckPro
//
//  iOS Native Module for Hardware Tests
//

import Foundation
import React
import AVFoundation
import CoreMotion

@objc(HardwareModule)
class HardwareModule: RCTEventEmitter {
  
  private var proximityObserver: NSObjectProtocol?
  private var audioRouteObserver: NSObjectProtocol?
  private let motionManager = CMMotionManager()
  
  override init() {
    super.init()
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func supportedEvents() -> [String]! {
    return [
      "onProximityChange",
      "onVolumeUpPress",
      "onVolumeDownPress",
      "onPowerButtonPress",
      "onHeadsetPlugChange"
    ]
  }
  
  // MARK: - Proximity Sensor
  
  @objc func startProximityTracking() {
    DispatchQueue.main.async {
      UIDevice.current.isProximityMonitoringEnabled = true
      
      self.proximityObserver = NotificationCenter.default.addObserver(
        forName: UIDevice.proximityStateDidChangeNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        let isNear = UIDevice.current.proximityState
        self?.sendEvent(withName: "onProximityChange", body: ["isNear": isNear])
      }
    }
  }
  
  @objc func stopProximityTracking() {
    DispatchQueue.main.async {
      UIDevice.current.isProximityMonitoringEnabled = false
      if let observer = self.proximityObserver {
        NotificationCenter.default.removeObserver(observer)
        self.proximityObserver = nil
      }
    }
  }
  
  // MARK: - Headphone Jack Detection
  
  @objc func startHeadsetMonitoring() {
    DispatchQueue.main.async {
      // Check current state
      let currentRoute = AVAudioSession.sharedInstance().currentRoute
      let isPlugged = self.isHeadsetPlugged(route: currentRoute)
      self.sendEvent(withName: "onHeadsetPlugChange", body: ["plugged": isPlugged])
      
      // Monitor changes
      self.audioRouteObserver = NotificationCenter.default.addObserver(
        forName: AVAudioSession.routeChangeNotification,
        object: nil,
        queue: .main
      ) { [weak self] notification in
        guard let self = self else { return }
        
        if let userInfo = notification.userInfo,
           let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
           let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) {
          
          let currentRoute = AVAudioSession.sharedInstance().currentRoute
          let isPlugged = self.isHeadsetPlugged(route: currentRoute)
          
          switch reason {
          case .newDeviceAvailable, .oldDeviceUnavailable:
            self.sendEvent(withName: "onHeadsetPlugChange", body: ["plugged": isPlugged])
          default:
            break
          }
        }
      }
    }
  }
  
  @objc func stopHeadsetMonitoring() {
    DispatchQueue.main.async {
      if let observer = self.audioRouteObserver {
        NotificationCenter.default.removeObserver(observer)
        self.audioRouteObserver = nil
      }
    }
  }
  
  private func isHeadsetPlugged(route: AVAudioSessionRouteDescription) -> Bool {
    for output in route.outputs {
      let portType = output.portType
      if portType == .headphones || portType == .bluetoothA2DP || portType == .bluetoothHFP {
        return true
      }
    }
    return false
  }
  
  // MARK: - Hardware Buttons
  // Note: iOS doesn't provide direct access to volume/power button events
  // We can only detect volume changes, not button presses
  
  @objc func startButtonMonitoring() {
    // iOS limitation: Cannot directly monitor hardware button presses
    // Volume buttons can be monitored via AVAudioSession volume changes
    // Power button cannot be monitored
    DispatchQueue.main.async {
      do {
        try AVAudioSession.sharedInstance().setActive(true)
      } catch {
        print("Failed to activate audio session: \(error)")
      }
    }
  }
  
  @objc func stopButtonMonitoring() {
    // Cleanup if needed
  }
  
  // MARK: - Audio Routing for Speaker/Earpiece Tests
  
  @objc func setAudioRoute(_ route: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      do {
        let audioSession = AVAudioSession.sharedInstance()
        
        try audioSession.setCategory(.playAndRecord, mode: .default, options: [])
        
        if route == "speaker" {
          try audioSession.overrideOutputAudioPort(.speaker)
        } else if route == "earpiece" {
          try audioSession.overrideOutputAudioPort(.none)
        }
        
        try audioSession.setActive(true)
        resolver(["success": true, "route": route])
      } catch {
        rejecter("AUDIO_ROUTE_ERROR", "Failed to set audio route: \(error.localizedDescription)", error)
      }
    }
  }
  
  @objc func getCurrentAudioRoute(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let currentRoute = AVAudioSession.sharedInstance().currentRoute
      var routeInfo: [String: Any] = [:]
      
      if let output = currentRoute.outputs.first {
        routeInfo["portType"] = output.portType.rawValue
        routeInfo["portName"] = output.portName
        
        // Determine if it's speaker or earpiece
        if output.portType == .builtInSpeaker {
          routeInfo["route"] = "speaker"
        } else if output.portType == .builtInReceiver {
          routeInfo["route"] = "earpiece"
        } else {
          routeInfo["route"] = "other"
        }
      }
      
      resolver(routeInfo)
    }
  }
  
  // MARK: - Cleanup
  
  override func invalidate() {
    stopProximityTracking()
    stopHeadsetMonitoring()
    stopButtonMonitoring()
    super.invalidate()
  }
}
