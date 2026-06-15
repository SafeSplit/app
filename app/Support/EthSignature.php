<?php

namespace App\Support;

use Elliptic\EC;
use kornrunner\Keccak;

/**
 * Recover the Ethereum address that produced an EIP-191 `personal_sign` signature.
 *
 * personal_sign hashes:  keccak256("\x19Ethereum Signed Message:\n" . len(msg) . msg)
 * then signs it with secp256k1. We recover the public key from (hash, r, s, v)
 * and derive the address = last 20 bytes of keccak256(pubkey).
 */
class EthSignature
{
    /** Returns the lowercase 0x-address, or null if the signature is malformed/unrecoverable. */
    public static function recoverAddress(string $message, string $signature): ?string
    {
        $sig = self::strip0x($signature);
        if (strlen($sig) !== 130) {
            return null; // expect 65 bytes: r(32) + s(32) + v(1)
        }

        $r = substr($sig, 0, 64);
        $s = substr($sig, 64, 64);
        $v = hexdec(substr($sig, 128, 2));

        if ($v < 27) {
            $v += 27;
        }
        $recoveryId = $v - 27;
        if ($recoveryId !== 0 && $recoveryId !== 1) {
            return null;
        }

        $hash = self::personalHash($message);

        try {
            $ec = new EC('secp256k1');
            $pubKey = $ec->recoverPubKey($hash, ['r' => $r, 's' => $s], $recoveryId);
        } catch (\Throwable $e) {
            return null;
        }

        // pubKey hex = "04" + x(64) + y(64); address = last 20 bytes of keccak256(x||y).
        $pubHex = $pubKey->encode('hex');
        $addressHash = Keccak::hash(hex2bin(substr($pubHex, 2)), 256);

        return '0x' . substr($addressHash, 24);
    }

    /** True if the signature recovers to the expected address (case-insensitive). */
    public static function verify(string $message, string $signature, string $expectedAddress): bool
    {
        $recovered = self::recoverAddress($message, $signature);

        return $recovered !== null
            && strtolower($recovered) === strtolower($expectedAddress);
    }

    /**
     * Recover the signer of a 32-byte digest (given as hex, e.g. our event_hash).
     * The browser signs `0x<digest>`, which MetaMask hex-decodes to the raw bytes,
     * so the EIP-191 message is the raw 32 bytes — not the hex text.
     */
    public static function recoverFromDigest(string $digestHex, string $signature): ?string
    {
        $raw = hex2bin(self::strip0x($digestHex));
        if ($raw === false) {
            return null;
        }

        return self::recoverAddress($raw, $signature);
    }

    /** True if the signature over the digest recovers to the expected address. */
    public static function verifyDigest(string $digestHex, string $signature, string $expectedAddress): bool
    {
        $recovered = self::recoverFromDigest($digestHex, $signature);

        return $recovered !== null
            && strtolower($recovered) === strtolower($expectedAddress);
    }

    private static function personalHash(string $message): string
    {
        $prefix = "\x19Ethereum Signed Message:\n" . strlen($message) . $message;

        return Keccak::hash($prefix, 256);
    }

    private static function strip0x(string $hex): string
    {
        return str_starts_with($hex, '0x') ? substr($hex, 2) : $hex;
    }
}
