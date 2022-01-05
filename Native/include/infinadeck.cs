using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
using System.Diagnostics;

//Commented out functions because breaking with InfinadeckApp included in SDK 1.5 and API included in 1.5

namespace Infinadeck
{
    public enum InfinadeckInitError
    {
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
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct SpeedVector2
    {
        public double v0;
        public double v1;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct Ring
    {
        public double x;
        public double y;
        public double z;
        public double r;
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct TreadmillInfo
    {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string id;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string model_number;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string dll_version;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct PositionVector3
    {
        public double x;
        public double y;
        public double z;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct QuaternionVector4
    {
        public double w;
        public double x;
        public double y;
        public double z;

    }

    [StructLayout(LayoutKind.Sequential)]
    public struct UserPositionRotation
    {
        public PositionVector3 position;
        public QuaternionVector4 quaternion;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct DiagnosticInfo
    {
        SpeedVector2 v;

    }
    public class InfinadeckInterOp
    {
        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetFloorSpeeds", CallingConvention = CallingConvention.Cdecl)]
        internal static extern SpeedVector2 GetFloorSpeeds();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetFloorSpeedsNormalized", CallingConvention = CallingConvention.Cdecl)]
        internal static extern SpeedVector2 GetFloorSpeedsNormalized();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetFloorSpeedMagnitude", CallingConvention = CallingConvention.Cdecl)]
        internal static extern double GetFloorSpeedMagnitude();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetFloorSpeedAngle", CallingConvention = CallingConvention.Cdecl)]
        internal static extern double GetFloorSpeedAngle();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "SetManualSpeeds", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void SetManualSpeeds(double x, double y);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "SetUserPosition", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void SetUserPosition(double x, double y);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "SetUserRotation", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void SetUserRotation(double w, double x, double y, double z);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "StartTreadmillUserControl", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void StartTreadmillUserControl();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "CheckConnection", CallingConvention = CallingConvention.Cdecl)]
        internal static extern bool CheckConnection();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetRing", CallingConvention = CallingConvention.Cdecl)]
        internal static extern Ring GetRing();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "SetTreadmillRunState", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void SetTreadmillRunState(bool state);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "StartTreadmillManualControl", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void StartTreadmillManualControl();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "StopTreadmill", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void StopTreadmill();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetTreadmillRunState", CallingConvention = CallingConvention.Cdecl)]
        internal static extern bool GetTreadmillRunState(bool get_lock);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetTreadmillSerialNumber", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void GetTreadmillSerialNumber(char[] buffer, int length);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetTreadmillInfo", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void GetTreadmillInfo(out TreadmillInfo info);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetUserPositionRotation", CallingConvention = CallingConvention.Cdecl)]
        internal static extern UserPositionRotation GetUserPositionRotation();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetDiagnostics", CallingConvention = CallingConvention.Cdecl)]
        internal static extern DiagnosticInfo GetDiagnostics();
         
        [DllImportAttribute("InfinadeckAPI", EntryPoint = "SetTreadmillPause", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void SetTreadmillPause(bool pause);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetTreadmillPauseState", CallingConvention = CallingConvention.Cdecl)]
        internal static extern bool GetTreadmillPauseState();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "SetVirtualRing", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void SetVirtualRing(bool enable);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetVirtualRingEnabled", CallingConvention = CallingConvention.Cdecl)]
        internal static extern bool GetVirtualRingEnabled();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetReferenceDeviceAngleDifference", CallingConvention = CallingConvention.Cdecl)]
        internal static extern QuaternionVector4 GetReferenceDeviceAngleDifference();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "InitInternal", CallingConvention = CallingConvention.Cdecl)]
        internal static extern uint InitInternal(ref InfinadeckInitError inError);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "DeInitInternal", CallingConvention = CallingConvention.Cdecl)]
        internal static extern uint DeInitInternal(ref InfinadeckInitError inError);
    }


    //MAKE SURE ALL OF THE BELOW ARE COMPLETE BEFORE SHIP
    class Infinadeck
    {
        /**
        * Loads internal functionality. Should be called during application
        * initialization
        */
        public static void InitConnection(ref InfinadeckInitError inError)
        {
            InfinadeckInterOp.InitInternal(ref inError);
            return;
        }

        /**
        * Unloads internal functionality. API functions should not be called after
        * this. Should be called on application exit.
        */
        public static void DeInitConnection(ref InfinadeckInitError inError)
        {
            InfinadeckInterOp.DeInitInternal(ref inError);
        }

        /**
        * Check if connection to treadmill service has been established.
        */
        public static bool CheckConnection()
        {
            return InfinadeckInterOp.CheckConnection();
        }

        /**
        * Returns the x and y floor speeds of the treadmill.
        */
        public static SpeedVector2 GetFloorSpeeds()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetFloorSpeeds();
        }

        /**
        * Returns the polar magnitude of the speed of the treadmill.
        */
        public static double GetFloorSpeedMagnitude()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetFloorSpeedMagnitude();
        }

        /**
        * Returns the polar direction of the speed of the treadmill.
        */
        public static double GetFloorSpeedAngle()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetFloorSpeedAngle();
        }

        public static void SetManualSpeeds(double x, double y)
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetManualSpeeds(x, y);
        }

        public static void SetUserPosition(double x, double y)
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetUserPosition(x, y);
        }

        public static void SetUserRotation(double w, double x, double y, double z)
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetUserRotation(w, x, y, z);
        }

        /**
        * Returns true if the treadmill is running, and false if the treadmill is 
        * stopped.
        */
        public static bool GetTreadmillRunState()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetTreadmillRunState(true);
        }

        /**
        * Requests a change in the treadmill's run state.
        */
        public static void RequestTreadmillRunState(bool run)
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetTreadmillRunState(run);
        }



        /**
        * Check if the treadmill is in "Calibration" mode
        * 
        * NOTE: Not currently implemented
        */
        public static bool GetCalibrating()
        {
            return false;
        }

        /**
        * Returns the x,y,z coordinates of the ring, which corresponds to the center
        * of the treadmill in VR space. Also retrieves the radius of the ring.
        */
        public static Ring GetRingValues()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetRing();
        }

        /**
        * Fills a TreadmillInfo struct with information about currently connected
        * treadmill
        *
        * NOTE: Not currently implemented
        */
        public static TreadmillInfo GetTreadmillInfo()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            TreadmillInfo info_payload;
            InfinadeckInterOp.GetTreadmillInfo(out info_payload);
            return info_payload;

        }

        public static void SetTreadmillPause(bool pause)
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetTreadmillPause(pause);
        }

        public static bool GetTreadmillPauseState()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetTreadmillPauseState();
        }

        public static void SetVirtualRing(bool pause)
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetVirtualRing(pause);
        }

        public static bool GetVirtualRingEnabled()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetVirtualRingEnabled();
        }

        public static QuaternionVector4 GetReferenceDeviceAngleDifference()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetReferenceDeviceAngleDifference();
        }
        //Deprecated Functions
        public static void SetTreadmillRunState(bool run) //FLAGGED FOR DEPRECATION, may just need to be deleted outright, your call
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetTreadmillRunState(run);
        }

        public static void StartTreadmillManualControl()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.StartTreadmillManualControl();
        }

        public static void StartTreadmillUserControl()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.StartTreadmillUserControl();
        }
        public static void StopTreadmill()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.StopTreadmill();
        }

        public static UserPositionRotation GetUserPositionRotation()
        {
            return InfinadeckInterOp.GetUserPositionRotation();
        }

        public static DiagnosticInfo GetDiagnostics()
        {
            return InfinadeckInterOp.GetDiagnostics();
        }
    }
}
