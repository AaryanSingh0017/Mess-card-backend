const express = require('express')
const router = express.Router()
const { createHash } = require('crypto')
const Dapp = require('./dapp-interact')

router.get('/', (req, res) => {
    res.render('securityVerify')
})

router.post('/verify', async (req, res) => {
    try {
        const { USN, Name } = req.body
        if (!USN || !Name) {
            return res.status(403).json({ message: 'Missing fields: USN and Name' })
        }
        const calcHash = createHash('sha256').update(JSON.stringify({USN, Name})).digest('hex')
        const hash = await Dapp.getMessCardHash(USN)
        const actualHash = hash.slice(2)
        res.status(200).json({
            calculated: calcHash,
            actual: actualHash,
            result: calcHash === actualHash
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Error verifying details' })
    }
})

module.exports = router