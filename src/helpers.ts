import { Site } from "./definitions";

export function newSite(name: string, path: string): Site {
  return {
    name, path,
    files: [],
    subSites: []
  };
}
