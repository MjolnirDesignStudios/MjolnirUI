// app/components/background-studio/studioReducer.ts
// useReducer-style state machine for the Background Studio.
// Exhaustive switch so adding a new action triggers a TS error if you forget
// to handle it.

import {
  type BackgroundLayer,
  type StudioState,
  type LayerType,
  makeSolid,
  makeGradient,
  makeMeshGradient,
  makeNoise,
  makeParticles,
  makeShapes,
  makeShaderPreset,
} from "./studioTypes";

export type StudioAction =
  | { type: "ADD_LAYER"; layerType: LayerType; presetId?: string }
  | { type: "REMOVE_LAYER"; id: string }
  | { type: "DUPLICATE_LAYER"; id: string }
  | { type: "MOVE_LAYER"; id: string; dir: -1 | 1 }
  | { type: "SELECT_LAYER"; id: string | null }
  | { type: "TOGGLE_VISIBLE"; id: string }
  | { type: "TOGGLE_LOCKED"; id: string }
  | { type: "RENAME_LAYER"; id: string; name: string }
  | {
      type: "PATCH_LAYER";
      id: string;
      patch: Partial<BackgroundLayer>;
    }
  | { type: "RENAME_STUDIO"; name: string }
  | { type: "SET_ASPECT"; aspect: StudioState["canvasAspect"] }
  | { type: "LOAD_STATE"; state: StudioState }
  | { type: "RESET" }
  | { type: "MARK_SAVED" };

function newLayer(type: LayerType, presetId?: string): BackgroundLayer {
  switch (type) {
    case "solid":
      return makeSolid();
    case "gradient":
      return makeGradient();
    case "mesh-gradient":
      return makeMeshGradient();
    case "noise":
      return makeNoise();
    case "particles":
      return makeParticles();
    case "shapes":
      return makeShapes();
    case "shader-preset":
      return makeShaderPreset(presetId || "ripple-grid");
  }
}

/** Maximum simultaneous layers — beyond this perf craters. */
export const MAX_LAYERS = 8;

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case "ADD_LAYER": {
      if (state.layers.length >= MAX_LAYERS) return state;
      const layer = newLayer(action.layerType, action.presetId);
      return {
        ...state,
        layers: [...state.layers, layer],
        activeLayerId: layer.id,
        dirty: true,
      };
    }

    case "REMOVE_LAYER": {
      const layers = state.layers.filter((l) => l.id !== action.id);
      const activeLayerId =
        state.activeLayerId === action.id
          ? layers[layers.length - 1]?.id ?? null
          : state.activeLayerId;
      return { ...state, layers, activeLayerId, dirty: true };
    }

    case "DUPLICATE_LAYER": {
      if (state.layers.length >= MAX_LAYERS) return state;
      const source = state.layers.find((l) => l.id === action.id);
      if (!source) return state;
      const copy: BackgroundLayer = JSON.parse(JSON.stringify(source));
      copy.id = `layer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      copy.name = `${source.name} copy`;
      const idx = state.layers.findIndex((l) => l.id === action.id);
      const layers = [
        ...state.layers.slice(0, idx + 1),
        copy,
        ...state.layers.slice(idx + 1),
      ];
      return { ...state, layers, activeLayerId: copy.id, dirty: true };
    }

    case "MOVE_LAYER": {
      const idx = state.layers.findIndex((l) => l.id === action.id);
      if (idx < 0) return state;
      const target = idx + action.dir;
      if (target < 0 || target >= state.layers.length) return state;
      const layers = [...state.layers];
      [layers[idx], layers[target]] = [layers[target], layers[idx]];
      return { ...state, layers, dirty: true };
    }

    case "SELECT_LAYER":
      return { ...state, activeLayerId: action.id };

    case "TOGGLE_VISIBLE":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.id ? { ...l, visible: !l.visible } : l
        ),
        dirty: true,
      };

    case "TOGGLE_LOCKED":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.id ? { ...l, locked: !l.locked } : l
        ),
        dirty: true,
      };

    case "RENAME_LAYER":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.id ? { ...l, name: action.name } : l
        ),
        dirty: true,
      };

    case "PATCH_LAYER": {
      return {
        ...state,
        layers: state.layers.map((l) => {
          if (l.id !== action.id) return l;
          if (l.locked) return l;
          // Cast through `unknown` to bypass discriminated-union narrowing.
          // Caller is responsible for sending a type-compatible patch.
          const merged = {
            ...(l as unknown as Record<string, unknown>),
            ...(action.patch as Record<string, unknown>),
          };
          return merged as unknown as BackgroundLayer;
        }),
        dirty: true,
      };
    }

    case "RENAME_STUDIO":
      return { ...state, name: action.name, dirty: true };

    case "SET_ASPECT":
      return { ...state, canvasAspect: action.aspect, dirty: true };

    case "LOAD_STATE":
      return { ...action.state, dirty: false };

    case "RESET":
      return {
        name: "Untitled Background",
        canvasAspect: "16/9",
        layers: [],
        activeLayerId: null,
        schemaVersion: state.schemaVersion,
        dirty: true,
      };

    case "MARK_SAVED":
      return { ...state, dirty: false };
  }
}
