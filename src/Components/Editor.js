import React , {useEffect, useRef} from 'react'
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/theme/dracula.css'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'

export default function Editor({socketRef,roomId}) {
  const editor = useRef(null);
  const stdOutput = useRef(null);
  const stdInput = useRef(null);
  const langOptions = useRef(null);
  const compileBtn = useRef(null);
  useEffect(() => {
    async function init(){
      editor.current = CodeMirror.fromTextArea(document.getElementById("realTimeEditor"),{
        mode : {name : 'javascript',json : true},
        theme : 'dracula',
        autoCloseTags: true,
        autoCloseBrackets : true,
        matchBrackets: true,
        lineNumbers : true,
      });

      editor.current.on("change",(instance,changes)=>{
        const {origin} = changes
        if(origin !== 'setValue'){
          socketRef.current.emit("updatedText",{roomId,newText : instance.getValue()})
        }
      })
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{
    if(socketRef.current){
      socketRef.current.on("setRoomText",({text,stdIn})=>{
        if(text != null){
          editor.current.setValue(text)
        }
        if(stdIn != null){
          stdInput.current.value = stdIn
        }
      })
      socketRef.current.on("updateText",({socketId,text})=>{
          if(socketRef.current.id !== socketId){
            if(text != null){
              editor.current.setValue(text)
            }
          }
      })
      socketRef.current.on("SetCode",({codeResult})=>{
        if(codeResult!= null){
          stdOutput.current.value = codeResult.output
        }
      })
      socketRef.current.on("SetLang",({lang})=>{
        langOptions.current.value = lang
      })
      socketRef.current.on("TurnPlain",()=>{
        editor.current.setOption("mode",'null');
        compileBtn.current.disabled = true;
      })
      socketRef.current.on("TurnCode",()=>{
        editor.current.setOption("mode", 'javascript')
        compileBtn.current.disabled = false;
      })
      socketRef.current.on("setInput",({input})=>{
          stdInput.current.value = input;
      })
    }
    return () => {
      socketRef.current.off("updateText");
      socketRef.current.off("setRoomText");
      socketRef.current.off("SetCode");
      socketRef.current.off("SetLang");
      socketRef.current.off("TurnPlain");
      socketRef.current.off("TurnCode");
      socketRef.current.off("setInput");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[socketRef.current])

  const getLanguage = () =>{
    let select = document.getElementById('language');
    const val = select.options[select.selectedIndex].value;
    return val
  }

  const getInput = () => {
   return stdInput.current ? stdInput.current.value : "";
  }
  const handleChange = () => {
    const lang = getLanguage()
    if(socketRef.current){
      socketRef.current.emit("OutputLang",{lang,roomId});
    }
  }
  const PlainText = () =>{
    editor.current.setOption("mode", 'null')
    compileBtn.current.disabled = true;
    if(socketRef.current){
        socketRef.current.emit("PlainMode",{roomId});
    }
  }
  const onstdInputChange = () => {
    const std_input = getInput();
    if(socketRef.current!==null &&  std_input.length >0){
      socketRef.current.emit("stdInputChange",{roomId,input : std_input});
    }
  }
  const Codemode = () => {
    if(compileBtn.current.disabled){
      editor.current.setOption("mode", 'javascript')
      compileBtn.current.disabled = false;
      if(socketRef.current){
        socketRef.current.emit("CodeMode",{roomId});
      }
    }
  }
  const compilecode =  async () =>{
    await fetch('/compile',{
        method : 'POST',
        headers : {'Accept': 'application/json','Content-Type' : 'application/json'},
        body : JSON.stringify({
          code : editor.current.getValue(),
          lang : getLanguage(),
          input : getInput()
        })
    })
    .then(res => res.json())
    .then(codeResult => {
      if(socketRef.current!==null && codeResult!==null){
        socketRef.current.emit("OutputCode",{codeResult,roomId});
      }
    }).catch((err)=>console.log(err))
  }
    return (
      <>
      <div className="CodeOptions">
      <button className = "btnop" ref = {compileBtn} onClick = {compilecode} id = "compiler" style={{marginRight: "3%" }}>Run Code</button>
      <label style={{color : "#09120d", fontSize : '18px',paddingRight:"1%",paddingTop:"0.3%",paddingLeft:"1%"}}>
          Language : 
      </label>
      <select style={{padding: "0.3%", backgroundColor:"paleturquoise",fontWeight : "bold", fontSize : "15px"}} ref = {langOptions} id="language" onChange={handleChange}>
          <option value="cpp17">C++17</option>
          <option value="cpp14">C++14</option>
          <option value="c">C</option>
          <option value="java">JAVA</option>
          <option value="python3">Python3</option>
          <option value="nodejs">NodeJs</option>
      </select>
      <button className = "btnop" onClick = {PlainText} style={{marginLeft : '5%'}} >Text-Editor Mode</button>
      <button className = "btnop" onClick = {Codemode} style={{marginLeft : '1%'}} >Code-Editor Mode</button>
      </div>
    <textarea id = "realTimeEditor">
    </textarea>
    <textarea ref={stdInput} onChange={onstdInputChange} className="stdinput" id="outputArea" rows = "7"  title="Input" placeholder="Input"></textarea>
    <textarea ref = {stdOutput} className="stdoutput" id="outputArea" rows = "7"  title="Output" placeholder="Output" readOnly></textarea>
    </>
  )
}
