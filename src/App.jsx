import React, { useEffect, useRef, useState } from "react";
import { Canvas, Rect, Circle, Triangle, Textbox, Control, util, FabricImage, Polygon, } from "fabric";
import "./App.css";
import Widgets from "./components/Widgets";

const generateStarPoints = (numPoints, outerRadius, innerRadius, centerX, centerY) => {
  const points = [];
  const angle = Math.PI / numPoints;

  for (let i = 0; i < 2 * numPoints; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + r * Math.cos(i * angle);
    const y = centerY + r * Math.sin(i * angle);
    points.push({ x, y });
  }

  return points;
};

const App = () => {
  const canvasRef = useRef(null);
  const [screenID, setScreenID] = useState('');
  const ws = new WebSocket("ws://34.123.38.44:3001");
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    if (canvasRef.current) return;

    const canvasEl = document.getElementById("canvas");
    const canvas = new Canvas(canvasEl);
    canvasRef.current = canvas;

    const deleteIcon =
      "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    const deleteImg = document.createElement("img");
    deleteImg.src = deleteIcon;

    const deleteObject = (_eventData, transform) => {
      const canvas = transform.target.canvas;
      canvas.remove(transform.target);
      canvas.requestRenderAll();
    };

    const renderIcon = (ctx, left, top, _styleOverride, fabricObject) => {
      const size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    };

    const addDeleteControl = (object) => {
      object.controls.deleteControl = new Control({
        x: 0.5,
        y: -0.5,
        offsetY: 16,
        cursorStyle: "pointer",
        mouseUpHandler: deleteObject,
        render: renderIcon,
        cornerSize: 24,
      });
    };


    // Attach delete control to every new object
    canvas.on("object:added", (e) => {
      addDeleteControl(e.target);
    });
  }, []);
    

  const addText = () => {
    const canvas = canvasRef.current;
    const text = new Textbox("Edit me!", {
      left: 100,
      top: 200,
      width: 200,
      fontSize: 20,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addImage = (event) => {
    console.log("Image added");
    const canvas = canvasRef.current;
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      console.log(reader);
      reader.onload = async (e) => {
        console.log(e.target.result);
        const fbimage = await FabricImage.fromURL(e.target.result);

        const maxWidth = 800;
        const maxHeight = 600;

        const imgWidth = fbimage.width;
        const imgHeight = fbimage.height;

        // Scale the image proportionally
        if (imgWidth > maxWidth || imgHeight > maxHeight) {
          const scaleFactor = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
          fbimage.scale(scaleFactor);
        }
        canvas.add(fbimage);
        canvas.setActiveObject(fbimage);
      };
      reader.readAsDataURL(file); // Convert the file to a data URL
    }
};

const setupConnection = ()=>{
  
  ws.onopen = () =>{
    ws.send(JSON.stringify({type:'join',screenID}));
  };

  
}
  const syncContent = ()=>{
    const elements = canvasRef.current.getObjects().map((obj, index) => ({
      id: index + 1,
      type: obj.type,
      left: obj.left,
      text:obj.text,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle,
    }));

    setObjects(elements);
    console.log("Objects" + JSON.stringify(elements));

    if(ws && ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify({type:'message', screenID, content: JSON.stringify(elements) }));
    }else{
      alert("Not Connected");
    }
  }
  
  const addShape = (shape) => {
    const canvas = canvasRef.current;
    let newShape;
    objects.push(shape);

    switch (shape) {
      case "rectangle":
        newShape = new Rect({ left: 100, top: 500, fill: "yellow", width: 100, height: 50 });
        break;
      case "triangle":
        newShape = new Triangle({ left: 100, top: 100, fill: "lightblue", width: 100, height: 100 });
        break;
      case "circle":
        newShape = new Circle({ left: 100, top: 200, fill: "pink", radius: 50 });
        break;
      case "Star":
        const starPoints = generateStarPoints(5, 50, 25, 100, 100); 
        newShape = new Polygon(starPoints, {
          left: 100,
          top: 100,
          fill: "gold",
          objectCaching: false,
        });
        break;
      default:
        return;
    }

    canvas.add(newShape);
    canvas.setActiveObject(newShape);
  };

  return (
    <div className="app">
      <header className="header">Design Editor</header>
      <div className="subheader">
        <div > Screen ID : 
        <input className="screenid-input" type="text" value={screenID} onChange={e=> setScreenID(e.target.value)}/>
        </div> 
        <button className="sync-button" onClick={setupConnection}>Join Connection</button>
        <button className="sync-button" onClick={syncContent}>Sync Content</button> 
      </div>
        
      <div className="content">
        <div className="sidebar">
          <Widgets
            onAddText={addText}
            onAddImage={addImage}
            onAddShape={addShape}
          />
        </div>
        <div className="main-content">
          <canvas id="canvas" width="1200" height="800" ></canvas>
        </div>
        
      </div>
    </div>
  );
};

export default App;
