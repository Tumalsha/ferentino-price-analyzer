import passengerCarRadial from './passengerCarRadial.json';
import eternopresa from './eternopresa.json';
import celestra from './celestra.json';
import lcv from './lcv.json';
import truckLightTruck from './truckLightTruck.json';
import twoThreeWheeler from './twoThreeWheeler.json';

// Add a new category by adding one entry here + one JSON file in /data.
export const categories = [
  { id: 'passenger-car-radial', icon: 'car', data: passengerCarRadial },
  { id: 'eternopresa', icon: 'tire', data: eternopresa },
  { id: 'celestra', icon: 'circle', data: celestra },
  { id: 'lcv', icon: 'truck-small', data: lcv },
  { id: 'truck-light-truck', icon: 'truck', data: truckLightTruck },
  { id: 'two-three-wheeler', icon: 'bike', data: twoThreeWheeler },
];
