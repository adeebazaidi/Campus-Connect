const FileUploader = ({ onChange }) => (
  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500 hover:border-primary">
    <input
      type="file"
      className="hidden"
      accept="image/*,application/pdf"
      multiple
      onChange={onChange}
    />
    <span className="font-semibold text-primary">Upload attachments</span>
    <span className="text-xs text-slate-400">PNG, JPG, PDF up to 5MB</span>
  </label>
);

export default FileUploader;


