-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE access_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE shipment_status AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled');

-- Table: access_requests
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  message TEXT,
  status access_request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_email_pending UNIQUE (email, status) WHERE status = 'pending'
);

-- Table: shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL UNIQUE,
  status shipment_status NOT NULL DEFAULT 'pending',
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  estimated_delivery DATE,
  actual_delivery DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: shipment_timeline
CREATE TABLE shipment_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  location TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_access_requests_email ON access_requests(email);
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_shipments_client_id ON shipments(client_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_documents_shipment_id ON documents(shipment_id);
CREATE INDEX idx_shipment_timeline_shipment_id ON shipment_timeline(shipment_id);
CREATE INDEX idx_shipment_timeline_timestamp ON shipment_timeline(timestamp DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_access_requests_updated_at
  BEFORE UPDATE ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_timeline ENABLE ROW LEVEL SECURITY;

-- Policy: access_requests - anyone can insert, only admins can read/update
CREATE POLICY "Anyone can create access requests"
  ON access_requests FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all access requests"
  ON access_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update access requests"
  ON access_requests FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: shipments - clients can only see their own shipments
CREATE POLICY "Clients can view their own shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can view all shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (true);

-- Policy: documents - clients can only see documents for their shipments
CREATE POLICY "Clients can view documents for their shipments"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = documents.shipment_id
      AND shipments.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can upload documents for their shipments"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = documents.shipment_id
      AND shipments.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

-- Policy: shipment_timeline - clients can only see timeline for their shipments
CREATE POLICY "Clients can view timeline for their shipments"
  ON shipment_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_timeline.shipment_id
      AND shipments.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all timeline entries"
  ON shipment_timeline FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert timeline entries"
  ON shipment_timeline FOR INSERT
  TO authenticated
  WITH CHECK (true);
