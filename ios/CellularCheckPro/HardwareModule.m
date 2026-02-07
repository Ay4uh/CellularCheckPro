//
//  HardwareModule.m
//  CellularCheckPro
//
//  Objective-C Bridge for HardwareModule
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(HardwareModule, RCTEventEmitter)

// Proximity Sensor
RCT_EXTERN_METHOD(startProximityTracking)
RCT_EXTERN_METHOD(stopProximityTracking)

// Headset Detection
RCT_EXTERN_METHOD(startHeadsetMonitoring)
RCT_EXTERN_METHOD(stopHeadsetMonitoring)

// Hardware Buttons
RCT_EXTERN_METHOD(startButtonMonitoring)
RCT_EXTERN_METHOD(stopButtonMonitoring)

// Audio Routing
RCT_EXTERN_METHOD(setAudioRoute:(NSString *)route
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrentAudioRoute:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
