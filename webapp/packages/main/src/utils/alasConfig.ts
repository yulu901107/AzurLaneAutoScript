import {ThemeObj, ALAS_CONFIG_YAML} from '@alas/common';
import type {Dirent} from 'fs';
import type {AlasConfig, DefAlasConfig} from '@alas/common';
import {checkIsFirst} from '@/utils/checkIsFirst';
import {webuiArgs, webuiPath} from '@/config';
import path from 'path';
import yaml from 'yaml';
import fs from 'fs';
import {getScriptRootPath} from '@/utils/getScriptRootPath';

let alasConfig: AlasConfig | null = null;
export async function getAlasConfig() {
  if (alasConfig === null) {
    const alasPath = getScriptRootPath('/config/deploy.template.yaml');
    const file = fs.readFileSync(path.join(alasPath, `./config/${ALAS_CONFIG_YAML}`), 'utf8');
    const config = yaml.parse(file) as DefAlasConfig;
    const WebuiPort = config.Deploy.Webui.WebuiPort.toString();
    const Theme = config.Deploy.Webui.Theme;
    alasConfig = {
      webuiUrl: `http://127.0.0.1:${WebuiPort}`,
      theme: ThemeObj[Theme] || 'light',
      language: config.Deploy.Webui.Language || 'en-US',
      repository: config.Deploy.Git.Repository as 'global' | 'china',
      alasPath,
      webuiPath,
      webuiArgs,
      dpiScaling: config.Deploy.Webui.DpiScaling || false,
    };
  }
  return alasConfig;
}

export function checkIsNeedInstall() {
  return checkIsFirst();
}

interface fileInfoItem {
  name: string;
  path: string;
  lastModifyTime: Date;
}
export function getAlasConfigDirFiles() {
  const alasPath = getScriptRootPath('/config/deploy.template.yaml');
  const configPath = path.join(alasPath, './config');
  const files: Dirent[] = fs.readdirSync(configPath, {withFileTypes: true});
  const filesInfoList: fileInfoItem[] = files.map((file: Dirent) => {
    const name = file.name;
    const filePath = path.join(configPath, name);
    return {
      name,
      path: filePath,
      lastModifyTime: getFileUpdateDate(filePath),
    };
  });
  return {
    configPath,
    files: filesInfoList,
  };
}

export function getFileUpdateDate(path: string) {
  const stat = fs.statSync(path);
  return stat.mtime;
}
