interface IPincodeComponent {
  length?: number;
  autofocus?: boolean;
  secure?: boolean;
  characterPreview?: boolean;
  previewDuration?: number;
  vModel: string;
}

declare module "vue-pincode-input" {
  const PincodeComponent: (props: IPincodeComponent) => any;
  export default PincodeComponent;
}
