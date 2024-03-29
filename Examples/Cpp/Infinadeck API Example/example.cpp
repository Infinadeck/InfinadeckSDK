// Copyright 2018-2019 Infinadeck

#define LOOP_PERIOD 500 // ms
#include <thread>
#include <atomic>
#include <iostream>
#include "infinadeck.h"
#include <winsock2.h>
#include <iphlpapi.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "iphlpapi.lib")


int main() {

  InfinadeckInitError e = InfinadeckInitError_None;;
  double x = 0;
  // Open connection to treadmill
    Infinadeck::InitInfinadeckConnection(&e);
  // Check if connection was successful
  if (e != InfinadeckInitError_None) {
    // Connection was not successful
    std::cout << "Error! Could not start connection" << std::endl;
    std::cout << "Press any key to exit" << std::endl;
    std::cin.ignore();
  }
  else {
    // Connection was successful
    std::cout << "Press any key to exit" << std::endl;
    std::atomic_bool run_loop = true;
    while (run_loop) {
      // Check if still connected to treadmill
      if (Infinadeck::CheckConnection()) {
        // Still connected
        // Retrieve the current run state of the treadmill
        Infinadeck::StartTreadmillManualControl();
        std::cout << "Run state: " <<
          Infinadeck::GetTreadmillRunState(true) << std::endl;
        Infinadeck::SetManualSpeeds(0.1, 0.1);
        Infinadeck::SpeedVector2 speed = Infinadeck::GetFloorSpeeds();
        std::cout << "Treadmill speeds: " << speed.v[0] << " " << speed.v[1] << std::endl;
        std::cout << "Ring position: " << Infinadeck::GetRing().z << std::endl;
        Infinadeck::SetManualSpeeds(1, 1);
      }
      else {
        // Connection was lost
        std::cout << "No connection" << std::endl;
      }
      // Run loop at desired speed
      std::this_thread::sleep_for(std::chrono::milliseconds(LOOP_PERIOD));
    }
    std::thread loop_thread([&] {

    });
    std::cin.ignore();
    run_loop = false;
    loop_thread.join();
  }
  // Close connection to treadmill
  Infinadeck::DeInitInfinadeckConnection();
  return 0;
}