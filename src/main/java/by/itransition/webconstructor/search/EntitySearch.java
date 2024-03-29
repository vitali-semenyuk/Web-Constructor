package by.itransition.webconstructor.search;

import by.itransition.webconstructor.domain.Page;
import org.apache.lucene.search.Query;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.FullTextQuery;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.query.dsl.QueryBuilder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;

@Repository
@Transactional
public class EntitySearch {

    @PersistenceContext
    private EntityManager entityManager;

    public List search(String text, Class entity, String... fields) {
        FullTextEntityManager fullTextEntityManager =
                Search.getFullTextEntityManager(entityManager);
        QueryBuilder queryBuilder = fullTextEntityManager
                .getSearchFactory()
                .buildQueryBuilder()
                .forEntity(entity).get();
        Query query = queryBuilder
                .keyword()
                .onFields(fields)
                .matching(text)
                .createQuery();
        FullTextQuery fullTextQuery = fullTextEntityManager.createFullTextQuery(query, entity);
        return fullTextQuery.getResultList();
    }

}
