const EStatusMonev = Object.freeze({
    AVAILABLE: 0,
    READ: 1,
    ON_SURVEY: 2,
    SUBMITTED: 3,
    SELESAI: 4,
})

const EStatusMonevs = Object.freeze([
    {
        id: EStatusMonev.AVAILABLE,
        description: 'Available'
    },
    {
        id: EStatusMonev.READ,
        description: 'Telah dibaca'
    },
    {
        id: EStatusMonev.ON_SURVEY,
        description: 'On Survey'
    },
    {
        id: EStatusMonev.SUBMITTED,
        description: 'Submitted'
    },
    {
        id: EStatusMonev.SELESAI,
        description: 'Selesai'
    },

])
export {EStatusMonev as default, EStatusMonevs}