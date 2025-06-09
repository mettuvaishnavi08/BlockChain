const IPFSService = require('./services/ipfs');
const ipfs = new IPFSService();

app.post('/api/issue-credential', async (req, res) => {
    try {
        const metadata = {
            name: 'Student Credential',
            degree: req.body.degree,
            student: req.body.studentWallet,
            issuedBy: req.body.institutionWallet,
            date: new Date().toISOString()
        };

        const result = await ipfs.uploadJSON(metadata);
        const ipfsHash = result.IpfsHash;

        // Optionally, store ipfsHash in MongoDB and call smart contract here

        res.json({ success: true, ipfsHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload credential to IPFS' });
    }
});
