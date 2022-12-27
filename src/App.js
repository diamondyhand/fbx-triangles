import "./styles.css";
import { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as OV from 'online-3d-viewer';
import fileToArrayBuffer from 'file-to-array-buffer';

export function ImportFile(importer, fileName, buffer, onReady) {
  let content = buffer;
  var extension = OV.GetFileExtension(fileName);
  let fileAccessor = new OV.ImporterFileAccessor(function (filePath) {
    return buffer;
  });
  importer.Import(fileName, extension, content, {
    getDefaultMaterialColor() {
      return new OV.RGBColor(0, 0, 0);
    },
    getFileBuffer: function (filePath) {
      return fileAccessor.GetFileBuffer(filePath);
    },
    onSuccess: function () {
      let model = importer.GetModel();
      onReady(model);
    },
    onError: function () {
    },
    onComplete: function () {
    }
  });
}

export function ImportFbxFile(fileName, buffer, onReady) {
  var importer = new OV.ImporterThreeFbx();
  ImportFile(importer, fileName, buffer, onReady);
}

export default function App() {
  const [selectedFileName, setSelectedFileName] = useState('1.fbx');
  const [triangles, setTriangles] = useState(0);

  const handleFileChange = (ev) => {
    const file = ev.target.files[0];
    setSelectedFileName(file.name);
    fileToArrayBuffer(file).then((data) => {
      ImportFbxFile(selectedFileName, data, function (model) {
        setTriangles(model.TriangleCount());
      })
    })
  }

  const Scene = () => {
    const fbx = useLoader(FBXLoader, selectedFileName);
    return <primitive object={fbx} scale={0.1} />;
  };

  return (
    <div className="App">
      <header className="App__header">
        <h2 style={{ color: 'red' }}>3d Model Triangles {triangles}</h2>
      </header>
      <section className="files">
        <input type="file" onChange={handleFileChange} />
      </section>

      <Canvas>
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls />
          <Environment preset="sunset" background />
        </Suspense>
      </Canvas>
    </div>
  );
}
