import FileSaver from "file-saver";
import { Checkbox } from "@blueprintjs/core";
import React, { useCallback, useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Promise from "bluebird";

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

function FileDropzone({ stereo }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((files: File[]) => {
    setUploading(true);

    Promise.map(
      files,
      async (file) => {
        const fileName = file.name.replace(/\.[^/.]+$/, "");

        const response = await fetch(
          "/convert?stereo=" + (stereo ? "1" : "0"),
          {
            method: "POST",
            body: file,
          }
        );

        if (response.status === 200) {
          const blob = await response.blob();
          if (blob.size !== 0) {
            FileSaver.saveAs(blob, fileName + ".ogg");
          }
        } else {
          const message = await response.text();
          console.warn(fileName, message);
          setError(`Error converting ${fileName}: ${message}`);
        }
      },
      { concurrency: 2 }
    ).then(
      () => {
        setUploading(false);
      },
      () => {
        setUploading(false);
      }
    );
  }, []);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ onDrop });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  return (
    <div>
      {error}
      {uploading ? (
        <h1>Converting...</h1>
      ) : (
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <h1>Drop the files here ...</h1>
          ) : (
            <h1>Drag 'n' drop some files here, or click to select files</h1>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [stereo, setStereo] = useState(false);

  return (
    <div style={{ margin: "24px" }}>
      <FileDropzone stereo={stereo} />
      <br />
      <Checkbox
        label="Stereo"
        checked={stereo}
        onChange={(event) => {
          setStereo((event.target as HTMLInputElement).checked);
        }}
      />
    </div>
  );
}
