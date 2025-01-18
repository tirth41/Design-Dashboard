import React from "react";
import "./Widgets.css";

const Widgets = ({ onAddText, onAddImage, onAddShape }) => {
  return (
    <div className="sidebar-left">
      <div className="sidebar-content">
        <h3>TEXT</h3>
        <button onClick={onAddText}>Text</button>
        <h3>IMAGE</h3>
        <label className="image-upload-button">
      Select Image
      <input
        type="file"
        accept="image/*"
        onChange={onAddImage}
        style={{ display: "none" }}  // Hide the default input button
      />
    </label>
        <button onClick={() => alert("GIF functionality not implemented!")}>GIF</button>
        <h3>SHAPE</h3>
        <button onClick={() => onAddShape("triangle")}>Triangle</button>
        <button onClick={() => onAddShape("rectangle")}>Rectangle</button>
        <button onClick={() => onAddShape("circle")}>Circle</button>
        <button onClick={() => onAddShape("Star")}>star</button>
      </div>
    </div>
  );
};

export default Widgets;
