export interface RoomHtml{
    number: string      // room number (from HTML)
    seats: number       // number of seats in the room (default = 0) (room capacity)
    type: string        // room type (from HTML)
    furniture: string   // room furniture (from HTML)
    href: string        // link to the room (`http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/{rooms_shortname+"-"+rooms_number}`)
}
