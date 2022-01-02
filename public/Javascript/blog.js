
let month = [
    'January',
    'February',
    'April',
    'March',
    'May', 
    'June', 
    'July', 
    'August', 
    'September', 
    'October', 
    'November', 
    'December'
   ]

   function getPostTime(time){
    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()
    let hours = time.getHours()
    let minutes = time.getMinutes()

    let postTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`;
    return postTime;
}
