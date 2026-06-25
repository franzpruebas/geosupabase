const TABLAS_PERMITIDAS = ['snap_ecu', 'pfe_ecu', 'bvp_ecu'];

module.exports = async function handler(req, res) {
    const { tabla } = req.query;

    if (!TABLAS_PERMITIDAS.includes(tabla)) {
        return res.status(400).json({ error: 'Tabla no permitida.' });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
        return res.status(500).json({ error: 'Variables de entorno no configuradas.' });
    }

    try {
        const upstream = await fetch(
            `${url}/rest/v1/${tabla}?select=*&limit=5000`,
            {
                headers: {
                    apikey: key,
                    Authorization: `Bearer ${key}`
                }
            }
        );

        if (!upstream.ok) {
            return res.status(upstream.status).json({ error: 'Error al consultar Supabase.' });
        }

        const data = await upstream.json();

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
