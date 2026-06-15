<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class NetworkController extends Controller
{
    /** Live network map: poll each Go node's /status and aggregate. */
    public function index(): Response
    {
        $nodes = collect(config('safesplit.nodes'))->map(function (string $url) {
            $url = rtrim($url, '/');
            try {
                $r = Http::timeout(2)->get($url . '/status');
                if ($r->successful()) {
                    $d = $r->json();

                    return [
                        'url' => $url,
                        'online' => true,
                        'id' => $d['id'] ?? '?',
                        'chain_height' => $d['chain_height'] ?? 0,
                        'tip' => $d['tip'] ?? null,
                        'events_count' => $d['events_count'] ?? 0,
                        'peers' => collect($d['peers'] ?? [])->map(fn ($p) => [
                            'address' => $p['address'] ?? '',
                            'active' => (bool) ($p['active'] ?? false),
                        ])->values(),
                    ];
                }
            } catch (\Throwable $e) {
                // fall through to offline
            }

            return [
                'url' => $url,
                'online' => false,
                'id' => null,
                'chain_height' => null,
                'tip' => null,
                'events_count' => null,
                'peers' => [],
            ];
        })->values();

        // In sync if all online nodes agree on chain height.
        $heights = $nodes->where('online', true)->pluck('chain_height')->unique();

        return Inertia::render('network', [
            'nodes' => $nodes,
            'in_sync' => $heights->count() <= 1,
            'online_count' => $nodes->where('online', true)->count(),
        ]);
    }
}
