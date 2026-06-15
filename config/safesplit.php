<?php

return [
    // JSON-RPC URL reachable FROM the app container (Hardhat is exposed on the host).
    'rpc_url' => env('SAFESPLIT_RPC_URL', 'http://host.docker.internal:49545'),

    // Go node that performs anchoring (BLOC 2.1+). Laravel posts signed events here.
    'node_url' => env('SAFESPLIT_NODE_URL', 'http://host.docker.internal:49170'),

    // All nodes, for the network map (BLOC 3.3).
    'nodes' => array_values(array_filter(array_map('trim', explode(',', env(
        'SAFESPLIT_NODE_URLS',
        'http://host.docker.internal:49170,http://host.docker.internal:49171,http://host.docker.internal:49172'
    ))))),

    // Unlocked Hardhat account used to send the anchoring transaction.
    // Default = Hardhat's first dev account (no private key needed; the node signs).
    'anchor_from' => env('SAFESPLIT_ANCHOR_FROM', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),

    // Shared deployment file written by the blockchain brick (decision D7).
    'deployment_path' => env('SAFESPLIT_DEPLOYMENT_PATH', storage_path('app/blockchain/deployment.json')),
];
