// Copyright 2018-2019 Infinadeck

#ifndef INFINADECK_H_
#define INFINADECK_H_

#include <cstdint>

#define API_VERSION_MAJOR 1
#define API_VERSION_MINOR 8
#define API_VERSION_BUILD 1

#define INFINADECK_SERIAL_NUMBER_MAX_LENGTH 40
/**
* Defines possible errors.
*/
enum InfinadeckInitError {
  InfinadeckInitError_None,
  InfinadeckInitError_Unknown,
  InfinadeckInitError_NoServer,
  InfinadeckInitError_UpdateRequired,
  InfinadeckInitError_InterfaceVerificationFailed,
  InfinadeckInitError_ControllerVerificationFailed,
  InfinadeckInitError_FailedInitialization,
  InfinadeckInitError_FailedHostResolution,
  InfinadeckInitError_FailedServerConnection,
  InfinadeckInitError_FailedServerSend,
};

enum InfinadeckAppType {
    InfinadeckAppType_Standalone,
    InfinadeckAppType_VRApplication,
    InfinadeckAppType_VRServer
};

namespace Infinadeck {
  /**
  * 2D vector representing speed in 2 directions. Convention is for index 0
  * to be X and index 1 to be Y.
  */
  struct SpeedVector2 {
    double v[2];
  };

  /**
  * Represents position of ring, or the center of the treadmill in VR space,
  * and the ring's radius.
  */
  struct Ring {
    double x;
    double y;
    double z;
    double r;
  };

  struct TreadmillInfo {
    char id[32];
    char model_number[32];
    char treadmill_version[32];
  };

  struct PositionVector3 {
      double x;
      double y;
      double z;
  };

  struct QuaternionVector4 {
      double w;
      double x;
      double y;
      double z;
  };

  struct UserPositionRotation {
      PositionVector3 position;
      QuaternionVector4 quaternion;
  };

  struct DiagnosticInfo {
      SpeedVector2 service_distance;
      SpeedVector2 total_distance;
      double service_hours;
      double total_hours;
  };

}
#if defined( _WIN32 )
#define API_CALLTYPE __cdecl
#else
#define API_CALLTYPE 
#endif

#ifdef INFINADECK_API_EXPORTS  
#define INFINADECK_API extern "C" __declspec(dllexport)   
#else  
#define INFINADECK_API extern "C" __declspec(dllimport)   
#endif  

namespace Infinadeck {

  /**
  * Returns the x and y floor speeds of the treadmill.
  */
  INFINADECK_API SpeedVector2 API_CALLTYPE GetFloorSpeeds();

  /*
  * Returns the x and y floor speeds of the treadmill, normalized to be between
  * 0 and 1.
  */
  INFINADECK_API SpeedVector2 API_CALLTYPE GetFloorSpeedsNormalized();

  /**
  * Returns the magnutide of the floor speed of the treadmill.
  */
  INFINADECK_API double API_CALLTYPE GetFloorSpeedMagnitude();

  /**
  * Returns the angle of the floor speed of the treadmill.
  */
  INFINADECK_API double API_CALLTYPE GetFloorSpeedAngle();

  /**
  * Sets manual floor speed of the treadmill.
  */
  INFINADECK_API void API_CALLTYPE SetManualSpeeds(double x, double y);

  /**
  * Sets the user's position.
  */
  INFINADECK_API void API_CALLTYPE SetUserPosition(double x, double y);

  /**
* Sets the user's position.
*/
  INFINADECK_API void API_CALLTYPE SetUserRotation(double w, double x, double y, double z);

  /**
* Start the treadmill using tracking controls.
*/
  INFINADECK_API void API_CALLTYPE StartTreadmillUserControl();

  /**
  * Check if connection to treadmill service has been established.
  */
  INFINADECK_API bool API_CALLTYPE CheckConnection();

  /**
  * Returns the x,y,z coordinates of the ring, which corresponds to the center
  * of the treadmill in VR space. Also retrieves the radius of the ring.
  */
  INFINADECK_API Ring API_CALLTYPE GetRing();

  /**
  * Set the treadmill to run or stop.
  */
  INFINADECK_API void SetTreadmillRunState(bool state);

  /**
* Start the treadmill in manual control mode.
*/
  INFINADECK_API void StartTreadmillManualControl();

  /**
* Stop the treadmill
*/
  INFINADECK_API void StopTreadmill();

  /**
  * Returns true if the treadmill is running, and false if the treadmill is
  * stopped.
  */
  INFINADECK_API bool API_CALLTYPE GetTreadmillRunState();

  /**
  * Get the serial number of the attached treadmill. Returns an empty string
  * if connected to a virtual treadmill.
  */
  INFINADECK_API void API_CALLTYPE GetTreadmillSerialNumber(char* string, int length);

  /**
  * Fills a TreadmillInfo struct with information about currently connected
  * treadmill
  *
  * NOTE: Not currently implemented
  */
  INFINADECK_API TreadmillInfo API_CALLTYPE GetTreadmillInfo();

  INFINADECK_API UserPositionRotation API_CALLTYPE GetUserPositionRotation();

  INFINADECK_API DiagnosticInfo API_CALLTYPE GetDiagnostics();

  /**
* Puts the treadmill into a "paused" state, where it will not move, but will
* remain "enabled"
*/
  INFINADECK_API void API_CALLTYPE SetTreadmillPause(bool enable);

  /**
  * Checks if the treadmill is in a "paused" state.
  */
  INFINADECK_API bool API_CALLTYPE GetTreadmillPauseState();

  /**
  * Enables or disables the virtual ring in the user's virtual display
  */
  INFINADECK_API void API_CALLTYPE SetVirtualRing(bool enable);

  /**
  * Checks if the virtual ring should be displayed to the user
  */
  INFINADECK_API bool API_CALLTYPE GetVirtualRingEnabled();

  /**
  * Gets the difference between the treadmill's floor angle and the selected device
  */
  INFINADECK_API QuaternionVector4 API_CALLTYPE GetReferenceDeviceAngleDifference();

  INFINADECK_API uint32_t API_CALLTYPE InitInternal(InfinadeckInitError* inError);
  
  /**
  * Loads internal functionality.
  */
  inline void InitInfinadeckConnection(InfinadeckInitError* err) {
    *err = InfinadeckInitError_None;
    InitInternal(err);
  }

  INFINADECK_API uint32_t API_CALLTYPE DeInitInternal();
  /**
  * Unloads internal functionality. API functions should not be called after
  * this.
  */
  inline void DeInitInfinadeckConnection() {
    DeInitInternal();
  }



}
#endif

