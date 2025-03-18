import React from 'react';
const { Content } = Layout;
const BodyMain = ()=>{
    const contentStyle = {
        textAlign: 'center',
        minHeight: 120,
        lineHeight: '120px',
        color: '#fff',
        backgroundColor: '#0958d9',
      };
    return(
    <Content style={contentStyle}>Content</Content>
    );
}
export default BodyMain;