// backend/src/config/database.js
const mongoose = require('mongoose');
const redis = require('redis');

class DatabaseConfig {
  constructor() {
    this.mongoConnection = null;
    this.redisClient = null;
    this.isMongoConnected = false;
    this.isRedisConnected = false;
  }

  // Initialize all database connections
  async initialize() {
    try {
      await Promise.all([
        this.connectMongoDB(),
        this.connectRedis()
      ]);
      
      console.log('✅ All database connections established');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      throw error;
    }
  }

  // MongoDB Connection
  async connectMongoDB() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic_credentials';
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 10,
        serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT) || 5000,
        socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT) || 45000,
        bufferMaxEntries: 0,
        retryWrites: true,
        retryReads: true
      };

      // Add authentication if provided
      if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
        options.auth = {
          username: process.env.MONGODB_USERNAME,
          password: process.env.MONGODB_PASSWORD
        };
        options.authSource = process.env.MONGODB_AUTH_SOURCE || 'admin';
      }

      this.mongoConnection = await mongoose.connect(mongoUri, options);
      
      // Event listeners
      mongoose.connection.on('connected', () => {
        console.log('🟢 MongoDB connected successfully');
        this.isMongoConnected = true;
      });

      mongoose.connection.on('error', (error) => {
        console.error('🔴 MongoDB connection error:', error);
        this.isMongoConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🟡 MongoDB disconnected');
        this.isMongoConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });

      return this.mongoConnection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  // Redis Connection
  async connectRedis() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      };

      // Add SSL configuration if enabled
      if (process.env.REDIS_TLS === 'true') {
        redisConfig.tls = {};
      }

      this.redisClient = redis.createClient(redisConfig);

      // Error handling
      this.redisClient.on('error', (error) => {
        console.error('🔴 Redis connection error:', error);
        this.isRedisConnected = false;
      });

      this.redisClient.on('connect', () => {
        console.log('🟢 Redis connected successfully');
        this.isRedisConnected = true;
      });

      this.redisClient.on('ready', () => {
        console.log('🟢 Redis ready to accept commands');
      });

      this.redisClient.on('end', () => {
        console.log('🟡 Redis connection ended');
        this.isRedisConnected = false;
      });

      // Connect to Redis
      await this.redisClient.connect();
      
      return this.redisClient;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      console.log('⚠️  Continuing without Redis cache');
      this.isRedisConnected = false;
      return null;
    }
  }

  // MongoDB Operations
  async findDocument(collection, query, options = {}) {
    try {
      const Model = mongoose.model(collection);
      return await Model.findOne(query, null, options);
    } catch (error) {
      console.error(`❌ Find document failed in ${collection}:`, error.message);
      throw error;
    }
  }

  async findDocuments(collection, query, options = {}) {
    try {
      const Model = mongoose.model(collection);
      return await Model.find(query, null, options);
    } catch (error) {
      console.error(`❌ Find documents failed in ${collection}:`, error.message);
      throw error;
    }
  }

  async createDocument(collection, data) {
    try {
      const Model = mongoose.model(collection);
      const document = new Model(data);
      return await document.save();
    } catch (error) {
      console.error(`❌ Create document failed in ${collection}:`, error.message);
      throw error;
    }
  }

  async updateDocument(collection, query, update, options = {}) {
    try {
      const Model = mongoose.model(collection);
      return await Model.findOneAndUpdate(query, update, { 
        new: true, 
        runValidators: true, 
        ...options 
      });
    } catch (error) {
      console.error(`❌ Update document failed in ${collection}:`, error.message);
      throw error;
    }
  }

  async deleteDocument(collection, query) {
    try {
      const Model = mongoose.model(collection);
      return await Model.findOneAndDelete(query);
    } catch (error) {
      console.error(`❌ Delete document failed in ${collection}:`, error.message);
      throw error;
    }
  }

  async aggregateDocuments(collection, pipeline) {
    try {
      const Model = mongoose.model(collection);
      return await Model.aggregate(pipeline);
    } catch (error) {
      console.error(`❌ Aggregate failed in ${collection}:`, error.message);
      throw error;
    }
  }

  async countDocuments(collection, query = {}) {
    try {
      const Model = mongoose.model(collection);
      return await Model.countDocuments(query);
    } catch (error) {
      console.error(`❌ Count documents failed in ${collection}:`, error.message);
      throw error;
    }
  }

  // Redis Cache Operations
  async cacheSet(key, value, expireInSeconds = 3600) {
    try {
      if (!this.isRedisConnected) return false;
      
      const serializedValue = JSON.stringify(value);
      await this.redisClient.setEx(key, expireInSeconds, serializedValue);
      return true;
    } catch (error) {
      console.error('❌ Redis SET failed:', error.message);
      return false;
    }
  }

  async cacheGet(key) {
    try {
      if (!this.isRedisConnected) return null;
      
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Redis GET failed:', error.message);
      return null;
    }
  }

  async cacheDelete(key) {
    try {
      if (!this.isRedisConnected) return false;
      
      await this.redisClient.del(key);
      return true;
    } catch (error) {
      console.error('❌ Redis DELETE failed:', error.message);
      return false;
    }
  }

  async cacheExists(key) {
    try {
      if (!this.isRedisConnected) return false;
      
      const exists = await this.redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('❌ Redis EXISTS failed:', error.message);
      return false;
    }
  }

  async cacheSetHash(hashKey, field, value) {
    try {
      if (!this.isRedisConnected) return false;
      
      await this.redisClient.hSet(hashKey, field, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('❌ Redis HSET failed:', error.message);
      return false;
    }
  }

  async cacheGetHash(hashKey, field) {
    try {
      if (!this.isRedisConnected) return null;
      
      const value = await this.redisClient.hGet(hashKey, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Redis HGET failed:', error.message);
      return null;
    }
  }

  async cacheGetAllHash(hashKey) {
    try {
      if (!this.isRedisConnected) return {};
      
      const hash = await this.redisClient.hGetAll(hashKey);
      const result = {};
      
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Redis HGETALL failed:', error.message);
      return {};
    }
  }

  // Session Management
  async createSession(sessionId, userData, expireInSeconds = 86400) {
    return await this.cacheSet(`session:${sessionId}`, userData, expireInSeconds);
  }

  async getSession(sessionId) {
    return await this.cacheGet(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return await this.cacheDelete(`session:${sessionId}`);
  }

  // Rate Limiting
  async incrementRateLimit(key, windowInSeconds = 900) {
    try {
      if (!this.isRedisConnected) return { count: 1, resetTime: Date.now() + windowInSeconds * 1000 };
      
      const current = await this.redisClient.get(key);
      
      if (current) {
        const count = await this.redisClient.incr(key);
        const ttl = await this.redisClient.ttl(key);
        return { 
          count, 
          resetTime: Date.now() + ttl * 1000 
        };
      } else {
        await this.redisClient.setEx(key, windowInSeconds, 1);
        return { 
          count: 1, 
          resetTime: Date.now() + windowInSeconds * 1000 
        };
      }
    } catch (error) {
      console.error('❌ Rate limit increment failed:', error.message);
      return { count: 1, resetTime: Date.now() + windowInSeconds * 1000 };
    }
  }

  // Analytics and Metrics
  async incrementCounter(counterKey) {
    try {
      if (!this.isRedisConnected) return 1;
      return await this.redisClient.incr(counterKey);
    } catch (error) {
      console.error('❌ Counter increment failed:', error.message);
      return 1;
    }
  }

  async getCounter(counterKey) {
    try {
      if (!this.isRedisConnected) return 0;
      const value = await this.redisClient.get(counterKey);
      return parseInt(value) || 0;
    } catch (error) {
      console.error('❌ Get counter failed:', error.message);
      return 0;
    }
  }

  // Pagination Helper
  async paginateQuery(collection, query, options = {}) {
    try {
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const skip = (page - 1) * limit;
      const sort = options.sort || { createdAt: -1 };

      const Model = mongoose.model(collection);
      
      const [documents, total] = await Promise.all([
        Model.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select(options.select || ''),
        Model.countDocuments(query)
      ]);

      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error(`❌ Pagination failed in ${collection}:`, error.message);
      throw error;
    }
  }

  // Database Health Check
  async healthCheck() {
    const health = {
      mongodb: {
        status: 'unknown',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      redis: {
        status: 'unknown',
        connected: this.isRedisConnected
      }
    };

    // MongoDB Health Check
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        health.mongodb.status = 'healthy';
      } else {
        health.mongodb.status = 'disconnected';
      }
    } catch (error) {
      health.mongodb.status = 'unhealthy';
      health.mongodb.error = error.message;
    }

    // Redis Health Check
    try {
      if (this.isRedisConnected) {
        await this.redisClient.ping();
        health.redis.status = 'healthy';
      } else {
        health.redis.status = 'disconnected';
      }
    } catch (error) {
      health.redis.status = 'unhealthy';
      health.redis.error = error.message;
    }

    return health;
  }

  // Cleanup and Shutdown
  async shutdown() {
    try {
      console.log('🔄 Shutting down database connections...');
      
      if (this.mongoConnection) {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
      }
      
      if (this.redisClient && this.isRedisConnected) {
        await this.redisClient.quit();
        console.log('✅ Redis connection closed');
      }
      
      console.log('✅ All database connections closed');
    } catch (error) {
      console.error('❌ Error during database shutdown:', error.message);
    }
  }

  // Getters
  getMongoConnection() {
    return this.mongoConnection;
  }

  getRedisClient() {
    return this.redisClient;
  }

  isConnected() {
    return {
      mongodb: this.isMongoConnected,
      redis: this.isRedisConnected
    };
  }
}

// Create singleton instance
const databaseConfig = new DatabaseConfig();

module.exports = {
  database: databaseConfig,
  mongoose,
  redis
};