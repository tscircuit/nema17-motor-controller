# NEMA 17 motor controller

RP2040 controller with a DRV8825 stepper driver, configurable 5–20 V USB-PD input, winding-current measurement, temperature sensing, and an optional AS5600 encoder. The four-layer PCB retains the original 42.30 × 42.32 mm placement and mounting outline.

Source: [imrishabh18/rp2040-motor-controller v1.0.58](https://tscircuit.com/imrishabh18/rp2040-motor-controller).

## Run

```sh
bun install --frozen-lockfile
bun run dev
```

```sh
bun run typecheck
bun run check:netlist
bun run build:unrouted
bun run build
bun run check:shorts
```

Saved routing, explicit trace paths, and the three fixed GPIO escape vias have been removed. Electrical connections, component placement, board geometry, routing constraints, and the 12 driver thermal vias are retained. The board uses tscircuit’s default local autorouter.

Placement analysis and the routed build have known validation findings; this circuit is not fabrication-ready. The autorouter reproduction is [tscircuit/tscircuit-autorouter#3958](https://github.com/tscircuit/tscircuit-autorouter/pull/3958). Use `build:unrouted` to inspect the circuit without routing. No firmware is included.

The dependency patches retain the source revision’s schematic-routing correction and copper-check compatibility fix.
