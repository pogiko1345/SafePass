const GROUND_FLOOR_BLUEPRINT = require("../assets/maps/GroundFloor.png");
const MEZZANINE_BLUEPRINT = require("../assets/maps/Mezzanine.png");
const SECOND_FLOOR_BLUEPRINT = require("../assets/maps/SecondFloor.png");
const THIRD_FLOOR_BLUEPRINT = require("../assets/maps/ThridFloor.png");

export const MONITORING_MAP_FLOORS = [
  { id: "ground", name: "Ground Floor", icon: "home-outline" },
  { id: "first", name: "Mezzanine", icon: "arrow-up-outline" },
  { id: "second", name: "Second Floor", icon: "layers-outline" },
  { id: "third", name: "Third Floor", icon: "layers-outline" },
];

export const MONITORING_MAP_OFFICES = [
  { id: "admin", name: "Administration", floor: "ground", icon: "business-outline" },
  { id: "registrar", name: "Registrar's Office", floor: "ground", icon: "document-text-outline" },
  { id: "accounting", name: "Accounting Office", floor: "ground", icon: "calculator-outline" },
  { id: "conference-room", name: "Conference Room", floor: "first", icon: "people-outline" },
  { id: "chairman", name: "Chairman", floor: "first", icon: "person-circle-outline" },
  { id: "flight-operations", name: "Flight Operations", floor: "first", icon: "airplane-outline" },
  { id: "head-of-training-room", name: "Head Of Training Room", floor: "first", icon: "school-outline" },
  { id: "it-room", name: "I.T Room", floor: "first", icon: "desktop-outline" },
  { id: "faculty-room", name: "Faculty Room", floor: "first", icon: "people-circle-outline" },
  { id: "academy-director", name: "Academy Director", floor: "first", icon: "briefcase-outline" },
  { id: "cr", name: "CR", floor: "first", icon: "water-outline" },
  { id: "sto", name: "STO", floor: "first", icon: "clipboard-outline" },
];

export const MONITORING_MAP_BLUEPRINTS = {
  ground: GROUND_FLOOR_BLUEPRINT,
  first: MEZZANINE_BLUEPRINT,
  mezzanine: MEZZANINE_BLUEPRINT,
  second: SECOND_FLOOR_BLUEPRINT,
  third: THIRD_FLOOR_BLUEPRINT,
};

export const MONITORING_MAP_OFFICE_POSITIONS = {
  admin: { x: 18, y: 36 },
  registrar: { x: 45, y: 44 },
  accounting: { x: 66, y: 42 },
  "conference-room": { x: 10, y: 36 },
  chairman: { x: 21, y: 40 },
  "flight-operations": { x: 33, y: 43 },
  "head-of-training-room": { x: 45, y: 42 },
  "it-room": { x: 57, y: 42 },
  "faculty-room": { x: 69, y: 36 },
  "academy-director": { x: 82, y: 37 },
  cr: { x: 94, y: 25 },
  sto: { x: 94, y: 44 },
};
