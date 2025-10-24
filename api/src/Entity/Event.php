<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Enum\EventStatus;
use App\Repository\EventRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Recurr\Rule;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: EventRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['event:read']],
    denormalizationContext: ['groups' => ['event:write']],
    security: "is_granted('ROLE_USER') and object.getCalendar().isReadableBy(user)"
)]
class Event
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['event:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'events')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['event:read','event:write'])]
    private ?Calendar $calendar = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $uid = null;

    #[ORM\Column(nullable: true)]
    private ?int $sequence = null;

    #[ORM\Column]
    #[Groups(['event:read','event:write'])]
    private ?\DateTimeImmutable $startsAt = null;

    #[ORM\Column]
    #[Groups(['event:read','event:write'])]
    #[Assert\GreaterThan(propertyPath: 'startsAt', message: 'The end date must be after the start date.')]
    private ?\DateTimeImmutable $endsAt = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank, Groups(['event:read','event:write'])]
    private string $title = '';

    #[ORM\Column(length: 255)]
    #[Assert\Timezone]
    #[Groups(['event:read','event:write'])]
    private ?string $timezone = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['event:read','event:write'])]
    private ?bool $allDay = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Regex('/^PT\d+H\d+M\d+S$/', message: 'Invalid duration format, use ISO 8601 duration format (e.g. PT1H30M)')]
    #[Groups(['event:read','event:write'])]
    private ?string $duration = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['event:read','event:write'])]
    private ?Rule $rrule = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['event:read','event:write'])]
    private ?Rule $exRule = null;

    #[ORM\Column(nullable: true)]
    #[Assert\All([
        new Assert\Type(\DateTimeImmutable::class, message: 'Each exclusion date must be a valid date.'),
        new Assert\DateTime(format: 'Y-m-d', message: 'Each exclusion date must be in the format Y-m-d.')
    ])]
    #[Groups(['event:read','event:write'])]
    private ?array $exDates = null;

    #[ORM\Column(nullable: true)]
    #[Assert\DateTime(format: 'Y-m-d', message: 'Recurrence ID must be a valid date in the format Y-m-d.')]
    private ?\DateTimeImmutable $recurrenceId = null;

    #[ORM\ManyToOne(inversedBy: 'events')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['event:read','event:write'])]
    private ?User $organizer = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class)]
    #[ORM\JoinTable(name: 'event_attendees')]
    #[ORM\JoinColumn(name: 'event_id', referencedColumnName: 'id')]
    #[ORM\InverseJoinColumn(name: 'user_id', referencedColumnName: 'id')]
    #[Groups(['event:read','event:write'])]
    private Collection $attendees;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['event:read','event:write'])]
    private ?string $description = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $reminders = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['event:read','event:write'])]
    private ?string $location = null;

    #[ORM\Column(nullable: true)]
    #[Assert\All([
        new Assert\Type('float', message: 'Latitude and longitude must be valid numbers.'),
        new Assert\Count(min: 2, max: 2, exactMessage: 'Latitude and longitude must be an array with exactly two elements.')
    ])]
    #[Groups(['event:read','event:write'])]
    private ?array $latLng = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Url(message: 'Conference URL must be a valid URL.')]
    #[Groups(['event:read','event:write'])]
    private ?string $conferenceUrl = null;

    #[ORM\Column(enumType: EventStatus::class)]
    #[Groups(['event:read','event:write'])]
    private EventStatus $status = EventStatus::CONFIRMED;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['event:read','event:write'])]
    private bool $private = false;

    #[ORM\Column]
    #[Groups(['event:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['event:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->attendees = new ArrayCollection();
    }

    public function getStatus(): EventStatus
    {
        return $this->status;
    }

    public function setStatus(EventStatus $status): void
    {
        $this->status = $status;
    }

    public function isPrivate(): bool
    {
        return $this->private;
    }

    public function setPrivate(bool $private): void
    {
        $this->private = $private;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCalendar(): ?Calendar
    {
        return $this->calendar;
    }

    public function setCalendar(?Calendar $calendar): static
    {
        $this->calendar = $calendar;

        return $this;
    }

    public function getUid(): ?string
    {
        return $this->uid;
    }

    public function setUid(?string $uid): static
    {
        $this->uid = $uid;

        return $this;
    }

    public function getSequence(): ?int
    {
        return $this->sequence;
    }

    public function setSequence(?int $sequence): static
    {
        $this->sequence = $sequence;

        return $this;
    }

    public function getStartsAt(): ?\DateTimeImmutable
    {
        return $this->startsAt;
    }

    public function setStartsAt(\DateTimeImmutable $startsAt): static
    {
        $this->startsAt = $startsAt;

        return $this;
    }

    public function getEndsAt(): ?\DateTimeImmutable
    {
        return $this->endsAt;
    }

    public function setEndsAt(\DateTimeImmutable $endsAt): static
    {
        $this->endsAt = $endsAt;

        return $this;
    }

    public function getTimezone(): ?string
    {
        return $this->timezone;
    }

    public function setTimezone(string $timezone): static
    {
        $this->timezone = $timezone;

        return $this;
    }

    public function isAllDay(): ?bool
    {
        return $this->allDay;
    }

    public function setAllDay(?bool $allDay): static
    {
        $this->allDay = $allDay;

        return $this;
    }

    public function getDuration(): ?string
    {
        return $this->duration;
    }

    public function setDuration(?string $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getRrule(): ?string
    {
        return $this->rrule;
    }

    public function setRrule(?string $rrule): static
    {
        $this->rrule = $rrule;

        return $this;
    }

    public function getExRule(): ?string
    {
        return $this->exRule;
    }

    public function setExRule(?string $exRule): static
    {
        $this->exRule = $exRule;

        return $this;
    }

    public function getExDates(): ?array
    {
        return $this->exDates;
    }

    public function setExDates(?array $exDates): static
    {
        $this->exDates = $exDates;

        return $this;
    }

    public function getRecurrenceId(): ?\DateTimeImmutable
    {
        return $this->recurrenceId;
    }

    public function setRecurrenceId(?\DateTimeImmutable $recurrenceId): static
    {
        $this->recurrenceId = $recurrenceId;

        return $this;
    }

    public function getOrganizer(): ?User
    {
        return $this->organizer;
    }

    public function setOrganizer(?User $organizer): static
    {
        $this->organizer = $organizer;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getAttendees(): Collection
    {
        return $this->attendees;
    }

    public function addAttendee(User $attendee): static
    {
        if (!$this->attendees->contains($attendee)) {
            $this->attendees->add($attendee);
        }

        return $this;
    }

    public function removeAttendee(User $attendee): static
    {
        $this->attendees->removeElement($attendee);

        return $this;
    }

    public function getReminders(): ?array
    {
        return $this->reminders;
    }

    public function setReminders(?array $reminders): static
    {
        $this->reminders = $reminders;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;

        return $this;
    }

    public function getLatLng(): ?array
    {
        return $this->latLng;
    }

    public function setLatLng(?array $latLng): static
    {
        $this->latLng = $latLng;

        return $this;
    }

    public function getConferenceUrl(): ?string
    {
        return $this->conferenceUrl;
    }

    public function setConferenceUrl(?string $conferenceUrl): static
    {
        $this->conferenceUrl = $conferenceUrl;

        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }
}
