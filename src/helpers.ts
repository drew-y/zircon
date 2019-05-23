import { SiteFolder } from "./definitions";

export function newSite(name: string, path: string): SiteFolder {
  return {
    name, path,
    files: [],
    subfolders: []
  };
}
