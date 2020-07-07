// Copyright Infinadeck 2018-2019
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace example{
    class example{
        static int loop_period = 5; // ms
        static void Main(string[] args){
            Infinadeck.InfinadeckInitError e = Infinadeck.InfinadeckInitError.InfinadeckInitError_None;
            // Open connection to treadmill
            Infinadeck.Infinadeck.InitConnection(ref e);

            double x = 0;
            // Check if connection was successful
            if(e == Infinadeck.InfinadeckInitError.InfinadeckInitError_None) {
                // Connection was successful
                Console.WriteLine("Press any key to exit");
                while(!Console.KeyAvailable) {
                    // Check if still connected to treadmill
                    if(Infinadeck.Infinadeck.CheckConnection()) {
                        // Still connected
                        // Retrieve the current run state of the treadmill
                        Console.WriteLine("Run state: {0}", Infinadeck.Infinadeck.GetTreadmillRunState());
                        // Get the x and y floor speeds
                        Infinadeck.SpeedVector2 vec = Infinadeck.Infinadeck.GetFloorSpeeds();
                        Console.WriteLine("X: {0} Y: {1}", vec.v0, vec.v1);
                        // Set treadmill to run
                        Infinadeck.Infinadeck.SetTreadmillRunState(true);
                        // Print ring position
                        Infinadeck.Ring ring = Infinadeck.Infinadeck.GetRingValues();
                        Console.WriteLine("Ring Position: {0} {1} {2}", ring.x, ring.y, ring.z);

                        Infinadeck.Infinadeck.SetUserPosition(x, x);
                        x += 0.02;
                        if (x > 0.6) x = 0;
                    }
                    else {
                        // Connection was lost
                        Console.WriteLine("No connection");
                    }
                    // Run loop at desired speed
                    System.Threading.Thread.Sleep(loop_period);
                }
            } else {
                Console.WriteLine("Error! Could not start connection");
                Console.WriteLine("Press any key to exit");
                // Connection was not successful
            }
            Infinadeck.Infinadeck.DeInitConnection(ref e);
        }
    }
}