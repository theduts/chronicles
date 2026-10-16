CREATE TABLE character_review_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    player_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    ticket_number BIGSERIAL,
    changes JSONB NOT NULL,
    dm_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_review_tickets_character_id ON character_review_tickets(character_id);
CREATE INDEX idx_review_tickets_campaign_id ON character_review_tickets(campaign_id);
CREATE INDEX idx_review_tickets_player_id ON character_review_tickets(player_id);
CREATE INDEX idx_review_tickets_status ON character_review_tickets(status);
