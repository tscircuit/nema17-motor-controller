/** Schematic membership only: the layout engine chooses every symbol position. */
export const functionalGroups = [
  { name: 'pd_supply_discharge', title: 'PD Supply Discharge', components: ['R_PD_VDD_PD'] },
  { name: 'rgb', title: 'RGB LED — Common Anode', components: ['D_STATUS'] },
  { name: 'rgb_red', title: 'Red Channel / GPIO25', components: ['R_STATUS_R', 'Q_STATUS_R'] },
  { name: 'rgb_green', title: 'Green Channel / GPIO2', components: ['R_STATUS_G', 'Q_STATUS_G'] },
  { name: 'rgb_blue', title: 'Blue Channel / GPIO3', components: ['R_STATUS_B', 'Q_STATUS_B'] },
  { name: 'enable_default', title: 'MCU Enable Default', components: ['R_MCU_ENABLE_PD'] },
  { name: 'motor_pd_connector', title: 'Motor USB-C Input', components: ['J_MOTOR_USB'] },
  { name: 'driver_supply', title: 'Motor Supply Bypass', components: ['C_VMA', 'C_VM_BULK', 'C_VM_HF'] },
  { name: 'driver_reference', title: '1 A Current Reference', components: ['C_DRV_3V3', 'R_DRV_REF_TOP', 'R_DRV_REF_BOTTOM', 'C_DRV_REF'] },
  { name: 'driver_current_limit', title: 'Winding Regulation Shunts', components: ['R_ISEN_A', 'R_ISEN_B'] },
  { name: 'driver_enable', title: 'Power-good, Sleep & Fault', components: ['R_DRV_ENABLE_PU', 'R_SLEEP_PD', 'R_FAULT_PU', 'Q_PD_ENABLE', 'R_PD_ENABLE_PU'] },
  { name: 'MCU__io_bypass', title: 'RP2040 I/O Supply Bypass', components: ['C_IOVDD1', 'C_IOVDD2', 'C_IOVDD3', 'C_IOVDD4', 'C_IOVDD5', 'C_IOVDD6'] },
  { name: 'MCU__analog_supply', title: 'ADC Supply Filter', components: ['L_AVDD', 'C_ADC'] },
  { name: 'mounting_ground', title: 'Grounded Mounting Holes', components: ['MH1', 'MH2', 'MH3', 'MH4'] },
] as const;

export const functionalGroupFor = (name?: string) =>
  functionalGroups.find(group => group.components.some(component => component === name));
