import FileSaver from "file-saver";
import { Checkbox } from "@blueprintjs/core";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

function FileDropzone({ stereo }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback((files) => {
    const file = files[0];
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    console.log(fileName);

    setUploading(true);
    fetch("/convert?stereo=" + (stereo ? "1" : "0"), {
      method: "POST",
      body: file,
    }).then(
      async (response) => {
        console.log(response);
        if (response.status === 200) {
          const blob = await response.blob();
          console.log(blob.size);
          if (blob.size !== 0) {
            FileSaver.saveAs(blob, fileName + ".ogg");
          }
        } else {
          const message = await response.text();
          console.warn(message);
          setError(message);
        }

        setUploading(false);
      },
      () => {
        setUploading(false);
      }
    );
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      {error != null ? `Error uploading: ${error}` : null}
      {uploading ? (
        <div>uploading...</div>
      ) : (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
      )}
    </>
  );
}

export default function App() {
  const [stereo, setStereo] = useState(false);

  return (
    <>
      <Checkbox
        label="Stereo"
        checked={stereo}
        onChange={(event) => {
          setStereo((event.target as HTMLInputElement).checked);
        }}
      />

      <FileDropzone stereo={stereo} />
    </>
  );
}
