const axios = require("axios")
const {Client} = require("pg")
const express = require("express")
const app =  express();
const {v4} = require("uuid")


const client = new Client({
    host:"localhost",
    port:5432,
    database: "ilcsdb",
    user:"postgres",
    password: "postgres",
})
app.use(express.json())


const connectFunction = (async () => {
    await client.connect()
 })
 connectFunction();

app.post("/biaya-impor", async (req,res) => {
    const {product_code, commodity_value} = req.body

    const result = await axios.get("https://insw-dev.ilcs.co.id/my/n/barang?hs_code=" + product_code)
    const resultCost = await axios.get("https://insw-dev.ilcs.co.id/my/n/tarif?hs_code=" + product_code)

    const nilai_bm=  commodity_value * (parseFloat(resultCost.data.data[0]["bm"])/100)
    const newObj = {
        id: v4(),
        kode_barang: product_code,
        uraian_barang: result.data.data[0]["sub_header"],
        bm: resultCost.data.data[0]["bm"],
        nilai_komoditas: commodity_value,
        nilai_bm,
        waktu_insert: new Date(),
    }

    const resultSql = await client.query("INSERT INTO biaya_impor(id_simulasi,kode_barang, uraian_barang, bm, nilai_komoditas, nilai_bm, waktu_insert) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    , [newObj.id, newObj.kode_barang, newObj.uraian_barang, newObj.bm, newObj.nilai_komoditas, newObj.nilai_bm, newObj.waktu_insert])




    res.send({
       "result":resultSql.rows[0]
    })


})

app.listen("3000" , () => {
    console.log("server is listening on port 3000")
})



