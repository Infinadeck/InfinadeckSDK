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

    public struct TreadmillInfo
    {
        public TreadmillInfo(char[] id, char[] model_number, char[] dll_version)
        {
            this.id = new string(id);
            this.model_number = new string(model_number);
            this.dll_version = new string(dll_version);
        }
        //FILL ME IN with whatever helpful metrics we want to provide (Total Deck Hours, Current Session Length, etc) and I will backfill to the actual about screen
        public string id;
        public string model_number;
        public string dll_version;
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct TreadmillInfoPayload
    {
        public char[] id;
        public char[] model_number;
        public char[] dll_version;
    }

    public class InfinadeckInterOp
    {
        [DllImportAttribute("InfinadeckAPI", EntryPoint = "InitInternal", CallingConvention = CallingConvention.Cdecl)]
        internal static extern uint InitInternal(ref InfinadeckInitError inError, bool use_server = false);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "DeInitInternal", CallingConvention = CallingConvention.Cdecl)]
        internal static extern uint DeInitInternal(ref InfinadeckInitError inError);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetFloorSpeeds", CallingConvention = CallingConvention.Cdecl)]
        internal static extern SpeedVector2 GetFloorSpeeds();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "VerifyControllerVersion", CallingConvention = CallingConvention.Cdecl)]
        internal static extern uint VerifyControllerVersion(ref InfinadeckInitError inError);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "VerifyInterfaceVersion", CallingConvention = CallingConvention.Cdecl)]
        internal static extern uint VerifyInterfaceVersion(ref InfinadeckInitError inError);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetRing", CallingConvention = CallingConvention.Cdecl)]
        internal static extern Ring GetRing();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetTreadmillRunState", CallingConvention = CallingConvention.Cdecl)]
        internal static extern bool GetTreadmillRunState(bool get_lock);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "SetTreadmillRunState", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void SetTreadmillRunState(bool state);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "StartTreadmillManualControl", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void StartTreadmillManualControl();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "StartTreadmillUserControl", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void StartTreadmillUserControl();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "StopTreadmill", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void StopTreadmill();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "CheckConnection", CallingConvention = CallingConvention.Cdecl)]
        internal static extern bool CheckConnection();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetAPILock", CallingConvention = CallingConvention.Cdecl)]
        internal static extern bool GetAPILock();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetTreadmillInfo", CallingConvention = CallingConvention.Cdecl)]
        internal static extern TreadmillInfoPayload GetTreadmillInfo();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "SetAPILock", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void SetAPILock(bool locked);

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetDemoMode", CallingConvention = CallingConvention.Cdecl)]
        internal static extern bool GetDemoMode();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "GetDemoTimeRemaining", CallingConvention = CallingConvention.Cdecl)]
        internal static extern double GetDemoTimeRemaining();

        [DllImportAttribute("InfinadeckAPI", EntryPoint = "SetBrake", CallingConvention = CallingConvention.Cdecl)]
        internal static extern void SetBrake(bool brake);

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
            if (inError != InfinadeckInitError.InfinadeckInitError_None)
            {
                InfinadeckInterOp.InitInternal(ref inError, true);
                return;
            }
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
            TreadmillInfoPayload info_payload = InfinadeckInterOp.GetTreadmillInfo();
            return new TreadmillInfo(info_payload.id, info_payload.model_number, info_payload.dll_version);

        }

        /**
        * Sets the API lock, which can prevent external applications from making 
        * changes to thre treadmill's state
        *
        * NOTE: Not currently implemented
        */
        public static bool GetAPILock()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetAPILock();
        }

        /**
        * Checks whether the treadmill is in "Demo" mode
        *
        * NOTE: Not currently implemented
        */
        public static void SetAPILock(bool locked)
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetAPILock(locked);
        }

        /**
        * Checks whether the treadmill is in "Demo" mode
        *
        * NOTE: Not currently implemented
        */
        public static bool GetDemoMode()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetDemoMode();
        }

        /**
        * Gets the remaining demo time, if the treadmill is in "Demo" mode
        *
        * NOTE: Not currently implemented
        */
        public static double GetDemoTimeRemaining()
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            return InfinadeckInterOp.GetDemoTimeRemaining();
        }

        //Deprecated Functions
        public static void SetTreadmillRunState(bool run) //FLAGGED FOR DEPRECATION, may just need to be deleted outright, your call
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetTreadmillRunState(run);
        }

        public static void SetBrake(bool brake)
        {
            InfinadeckInitError e = InfinadeckInitError.InfinadeckInitError_None;
            if (!CheckConnection()) InitConnection(ref e);
            InfinadeckInterOp.SetBrake(brake);
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
    }
}
