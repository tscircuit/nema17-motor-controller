import { Fragment } from "react";

/** Heat-spreading copper for the twelve vias in the imported DRV8825 footprint. */
export const Drv8825ThermalCopper = () => <>
  {(["inner1", "inner2"] as const).map(layer => <Fragment key={layer}><copperpour
    name={`DRV_EP_GND_${layer}`} layer={layer} connectsTo="net.GND"
    outline={[{x:2.55,y:-14.55},{x:6.05,y:-14.55},{x:6.05,y:-8.95},{x:2.55,y:-8.95}]}
    clearance="0.2mm" padMargin="0.2mm" traceMargin="0.2mm"
    useThermalReliefs={false} coveredWithSolderMask
  /></Fragment>)}
</>;
