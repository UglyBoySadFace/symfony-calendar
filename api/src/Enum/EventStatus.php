<?php

namespace App\Enum;

enum EventStatus: string
{
    case TENTATIVE = 'tentative';
    case CONFIRMED = 'confirmed';
    case CANCELLED = 'cancelled';

    public function isTentative(): bool
    {
        return $this === self::TENTATIVE;
    }

    public function isConfirmed(): bool
    {
        return $this === self::CONFIRMED;
    }

    public function isCancelled(): bool
    {
        return $this === self::CANCELLED;
    }
}
