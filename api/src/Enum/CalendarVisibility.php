<?php

namespace App\Enum;

enum CalendarVisibility: string
{
    case PRIVATE = 'private';
    case PUBLIC = 'public';
    case SHARED = 'shared';

    public function isPublic(): bool
    {
        return $this === self::PUBLIC;
    }

    public function isPrivate(): bool
    {
        return $this === self::PRIVATE;
    }

    public function isShared(): bool
    {
        return $this === self::SHARED;
    }
}
