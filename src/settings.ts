import FS from "fs";
import PATH from "path";

export interface ISettings {
  sshKey: string;
  sshUser: string;
}
interface IPackage {
  name: string;
}
/**
 * 从JSON文件中加载并解析返回对象
 * @param file 绝对路径或者相对于应用根目录的相对路径
 * @param dv
 * @returns
 */
export const loadJsonFile = <T>(file: string, dv?: T) => {
  if (!PATH.isAbsolute(file)) {
    file = PATH.relative(appDir, file);
  }
  if (!FS.existsSync(file)) return dv;
  try {
    return <T>JSON.parse(FS.readFileSync(file).toString());
  } catch {
    return dv;
  }
};
const checkPackage = (file: string) => {
  const packageData = loadJsonFile<IPackage>(file);
  return packageData?.name === "x-tunnel-ssh";
};
const checkAppDir = () => {
  const packageFiles = [
    PATH.join(__dirname, "package.json"),
    PATH.resolve(__dirname, "..", "package.json"),
  ];
  for (let i = 0; i < packageFiles.length; i++) {
    const file = packageFiles[i];
    if (FS.existsSync(file) && checkPackage(file)) {
      return PATH.dirname(file);
    }
  }
  throw new Error("应用文件缺失");
};
const appDir = checkAppDir();

export const loadSettingsAsync = async () => {
  if (appDir == null) return undefined;
  const configFile = PATH.join(appDir, "data", "settings.json");
  // if(!FS.existsSync(configFile)) return null;
  // const config = <ISettings>JSON.parse(FS.readFileSync(configFile).toString());
  // return config;
  return loadJsonFile<ISettings>(configFile);
};
/**
 * 检查文件是否存在
 * 
 * @param file 如果指定的是相对路径，那么是相对应用跟目录
 * @returns 
 */
export const fileExists = (file:string) => PATH.isAbsolute(file) ? FS.existsSync(file) : FS.existsSync(PATH.resolve(appDir, file));
export const checkFile = (file:string):[boolean, string] => {
  const absolutePath = PATH.isAbsolute(file) ? file : PATH.resolve(appDir, file);
  return [FS.existsSync(absolutePath), absolutePath];
}