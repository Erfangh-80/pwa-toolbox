/**
 * Minimal ambient typings for browser APIs that are not part of TypeScript's
 * bundled lib.dom yet (Web Bluetooth, WebUSB, Network Information, Badging, and
 * File System Access). Only the surface used by the toolbox is declared, and all
 * names are prefixed with `Toolbox` to avoid clashing with future lib.dom updates.
 */

interface ToolboxBluetoothRemoteGATTServer {
  readonly connected: boolean;
  connect(): Promise<ToolboxBluetoothRemoteGATTServer>;
  disconnect(): void;
}

interface ToolboxBluetoothDevice extends EventTarget {
  readonly id: string;
  readonly name?: string | null;
  readonly gatt?: ToolboxBluetoothRemoteGATTServer;
}

interface ToolboxBluetooth {
  requestDevice(options: {
    acceptAllDevices?: boolean;
    filters?: Array<{ services?: string[]; name?: string; namePrefix?: string }>;
    optionalServices?: string[];
  }): Promise<ToolboxBluetoothDevice>;
  getAvailability?(): Promise<boolean>;
}

interface ToolboxUsbDevice {
  readonly vendorId: number;
  readonly productId: number;
  readonly productName?: string;
  readonly manufacturerName?: string;
  readonly serialNumber?: string;
  readonly opened: boolean;
  readonly configurations: ReadonlyArray<{ configurationValue: number }>;
  open(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  close(): Promise<void>;
}

interface ToolboxUsb {
  requestDevice(options: { filters: Array<Record<string, unknown>> }): Promise<ToolboxUsbDevice>;
  getDevices?(): Promise<ToolboxUsbDevice[]>;
}

interface ToolboxNetworkInformation extends EventTarget {
  readonly type?: string;
  readonly effectiveType?: string;
  readonly downlink?: number;
  readonly downlinkMax?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
  onchange: ((this: ToolboxNetworkInformation, event: Event) => void) | null;
}

interface ToolboxFileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>;
  close(): Promise<void>;
}

interface ToolboxFileSystemFileHandle {
  readonly name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<ToolboxFileSystemWritableFileStream>;
}

interface ToolboxFilePickerType {
  description?: string;
  accept: Record<string, string[]>;
}

interface ToolboxOpenFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: ToolboxFilePickerType[];
}

interface ToolboxSaveFilePickerOptions {
  suggestedName?: string;
  excludeAcceptAllOption?: boolean;
  types?: ToolboxFilePickerType[];
}

interface Navigator {
  readonly bluetooth?: ToolboxBluetooth;
  readonly usb?: ToolboxUsb;
  readonly connection?: ToolboxNetworkInformation;
  readonly standalone?: boolean;
  setAppBadge?(contents?: number): Promise<void>;
  clearAppBadge?(): Promise<void>;
}

interface Window {
  showOpenFilePicker?(
    options?: ToolboxOpenFilePickerOptions,
  ): Promise<ToolboxFileSystemFileHandle[]>;
  showSaveFilePicker?(
    options?: ToolboxSaveFilePickerOptions,
  ): Promise<ToolboxFileSystemFileHandle>;
}
