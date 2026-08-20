import passengerCarRadial from './passengerCarRadial.json';
import eternopresa from './eternopresa.json';
import celestra from './celestra.json';
import lcv from './lcv.json';
import truckLightTruck from './truckLightTruck.json';
import twoThreeWheeler from './twoThreeWheeler.json';

// Add a new category by adding one entry here + one JSON file in /data.
// `subTabs: true` renders each group as a clickable sub-tab instead of a
// single table with inline group-header rows. Only set this where it's
// explicitly wanted — it does not turn on automatically just because a
// category happens to have more than one group.
export const categories = [
  {
    id: 'passenger-car-radial',
    icon: 'car',
    data: {
      ...passengerCarRadial,
      groups: [...passengerCarRadial.groups, ...eternopresa.groups, ...celestra.groups],
    },
    subTabs: true,
  },
  { id: 'lcv', icon: 'truck-small', data: lcv },
  { id: 'truck-light-truck', icon: 'truck', data: truckLightTruck },
  { id: 'two-three-wheeler', icon: 'bike', data: twoThreeWheeler, subTabs: true },
];
