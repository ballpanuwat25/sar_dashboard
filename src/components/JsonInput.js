import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";

export default function JsonInput({value, onChange}) {
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden' }}>
        <CodeMirror
        value={value}
        height="208px"
        extensions={[json()]} // เปิดโหมด JSON
        onChange={(val) => onChange(val)}
        theme="dark"
        basicSetup={{
            lineNumbers: true,
            autocompletion: true, // auto complete ปีกกาและโครงสร้าง
            indentOnInput: true,
        }}
        />
    </div>
  );
}