import type { Config } from "tailwindcss";

const config = {
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        forest: "#173f3a",
        "forest-deep": "#0b2a27",
        cream: "#f4f0e6",
        paper: "#fffdf8",
        orange: "#e25f2d",
        "orange-dark": "#cb4d20",
        gold: "#e8aa2e",
        sage: "#b7c2b8",
        "field-border": "#d6ddda",
        "field-text": "#53615d",
        muted: "#74817d",
        "muted-dark": "#65736f",
        "muted-light": "#9ca8a4",
        line: "#dce2df",
        "line-soft": "#edf0ee",
        "surface-soft": "#eef3ef",
        "surface-input": "#f8faf8",
        "orange-soft": "#f8e4d9",
        danger: "#c7442a",
        "danger-text": "#8d2f1e",
        "danger-soft": "#fff0eb",
        "map-surface": "#dfe7e2",
        "timeline-icon": "#e8efeb",
        "fuel-soft": "#f3d88f",
        "hero-copy": "#cad7d3",
        "hero-muted": "#aebfba",
        "rule-muted": "#acbdb8",
        "heading-muted": "#76837f",
        meta: "#687671",
        "identity-text": "#26332f",
        "grid-strong": "#93a39f",
        grid: "#d8dfdc",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(11, 42, 39, 0.1)",
        "panel-strong": "0 18px 50px rgba(11, 42, 39, 0.16)",
        popover: "0 24px 55px rgba(11, 42, 39, 0.24)",
        menu: "0 14px 30px rgba(11, 42, 39, 0.2)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at 84% 30%, rgba(232, 170, 46, 0.18), transparent 25%), linear-gradient(125deg, #0b2a27, #173f3a)",
        "route-dash":
          "repeating-linear-gradient(90deg, #b7c2b8 0 10px, transparent 10px 16px)",
      },
    },
  },
} satisfies Config;

export default config;
