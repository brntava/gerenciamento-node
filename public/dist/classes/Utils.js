class Utils {

    // Metodo Estatico

    static dateFormat(date){

        date = new Date();

        return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();

    }

}