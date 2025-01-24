export interface Room{
    fullname: string,    // full building name (from HTML h2 tag)
    shortname: string,   // short building name (same as filename for each building file)
    number: string,     // room number (from HTML)
    name: string,        // rooms_shortname + "_" + rooms_number
    address: string,     // building address
    lat: number,         // latitude from API
    lon: number,         // longitude from API
    seats: number,       // number of seats in the room (default = 0) (room capacity)
    type: string,        // room type (from HTML)
    furniture: string,   // room furniture (from HTML)
    href: string        // link to the room (`http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/{rooms_shortname+"-"+rooms_number}`)
}
