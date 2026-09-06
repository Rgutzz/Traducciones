exports.handler=async function(){
  const url=process.env.GOOGLE_SHEETS_API_URL||'https://script.google.com/macros/s/AKfycbws2--NQT2neouLvMFm0IkVg6kurezsbtL3f1X5Dl49V4jmqEnTPLTxlAtkU5i10drh/exec';
  try{
    const response=await fetch(url);
    if(!response.ok)return{statusCode:response.status,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'No se pudo consultar Google Sheets'})};
    const data=await response.json();
    return{statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(data)};
  }catch(error){return{statusCode:500,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:error.message})};}
};
