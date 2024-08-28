export const GetstringDate=(date)=>{
    const date1=new Date(date);
    const datestring=date1.toLocaleDateString();
    return datestring;
}

export const getcapitalLetter=(name)=>{
    return name.charAt(0).toUpperCase();
}