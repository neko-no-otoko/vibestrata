import { HexColor } from "../core/types";

export interface PaletteSyncAdapter {
  applyPalette(palette: HexColor[]): void;
}

export class AndroidMaterialYouAdapter implements PaletteSyncAdapter {
  applyPalette(palette: HexColor[]): void {
    // TODO: bind to Material You dynamic color APIs.
    console.info("Applying Material You palette", palette);
  }
}

export class IOSHierarchicalEffectAdapter implements PaletteSyncAdapter {
  applyPalette(palette: HexColor[]): void {
    // TODO: bind to iOS hierarchical UI effects and vibrancy layers.
    console.info("Applying iOS Hierarchical Effect palette", palette);
  }
}
